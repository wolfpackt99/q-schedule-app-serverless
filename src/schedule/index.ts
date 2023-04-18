import { AppHomeOpenedEvent } from "@slack/bolt";
import { StringIndexed } from "@slack/bolt/dist/types/helpers";
import { Context } from "@slack/bolt/dist/types/middleware";
import { Logger, WebClient } from "@slack/web-api";
import { CalendarService } from "../services";
import { CalendarItem } from "../services/calender-service";

export class schedule {
  dayArray = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  async getView(
    event: AppHomeOpenedEvent,
    client: WebClient,
    context: Context & StringIndexed
  ) {
    try {
      var calendar = new CalendarService();
      await calendar.getThisWeeks(async (calItems: CalendarItem[]) => {
        const calBlocks = this.getViewItems(calItems);
        // Call views.publish with the built-in client
        const result = await client.views.publish({
          // Use the user ID associated with the event
          user_id: event.user,
          view: {
            // Home tabs must be enabled in your app configuration page under "App Home"
            type: "home",
            blocks: [
              {
                type: "section",
                text: {
                  type: "mrkdwn",
                  text: "*Upcoming Q List :calendar:*",
                },
              },
              ...calBlocks,
            ],
          },
        });
      });
    } catch (error) {}
  }

  private getViewItems(items: CalendarItem[]) {
    var arr = new Array<any>();
    var lastDate = "";
    items.forEach((element) => {
      const curDate = new Date(element.Start).toLocaleDateString("en-US");
      if ("" + curDate !== lastDate) {
        arr.push({
          type: "section",
          text: {
            type: "mrkdwn",
            text: `*${
              this.dayArray[new Date(element.Start).getDay()]
            } - ${curDate}*`,
          },
        });
      }
      arr.push({
        type: "section",
        text: {
          type: "mrkdwn",
          text: `${element.CalendarName} - ${element.Title}`,
        },
      });
      lastDate = "" + curDate;
    });
    return arr;
  }
}
