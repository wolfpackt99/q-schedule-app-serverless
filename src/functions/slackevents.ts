import {
  app,
  HttpRequest,
  HttpResponseInit,
  InvocationContext,
} from "@azure/functions";
import { App, LogLevel } from "@slack/bolt";
import { schedule } from "../schedule";
import { AzureFunctionsReceiver } from "./azure-function-receiver";

export async function slackevents(
  request: HttpRequest,
  context: InvocationContext
): Promise<HttpResponseInit> {
  context.log(`Http function processed request for url "${request.url}"`);
  const receiver = new AzureFunctionsReceiver(
    process.env["SLACK_SIGNING_SECRET"] as string,
    context.log
  );

  const slackApp = new App({
    token: process.env["SLACK_BOT_TOKEN"],
    signingSecret: process.env["SLACK_SIGNING_SECRET"],
    receiver: receiver,
    logLevel: LogLevel.DEBUG,
    socketMode: false,
  });

  slackApp.event("app_home_opened", async ({ event, client, context }) => {
    try {
      var s = new schedule();
      await s.getView(event, client, context);
    } catch (error) {
      context.log(error);
    }
  });

  const body = await receiver.requestHandler(request);
  return { status: 200, body: body };
}

app.http("slackevents", {
  methods: ["GET", "POST"],
  authLevel: "anonymous",
  handler: slackevents,
});
