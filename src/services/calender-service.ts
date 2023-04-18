import { FirebaseApp, initializeApp } from "firebase/app";
import { getDatabase, onValue, ref } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: process.env.FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.FIREBASE_DATABASE_URL,
  projectId: process.env.FIREBASE_PROJECT_ID,
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.FIREBASE_MESSENGING_SENDER_ID,
  appId: process.env.FIREBASE_APP_ID,
};

export class CalendarService {
  private app: FirebaseApp;

  constructor() {
    this.app = initializeApp(firebaseConfig);
  }

  async getThisWeeks(callback: Function) {
    var items = new Array<CalendarItem>();
    var db = getDatabase(this.app);
    const postListRef = ref(db, "thisweek");
    onValue(
      postListRef,
      (snapshot) => {
        let today = new Date();
        let endDate = today.setDate(today.getDate() + 14);
        snapshot.forEach((childSnapshot) => {
          const childData: CalendarItem = childSnapshot.val();
          items.push(childData);
          items = items.sort((a, b) => +new Date(a.Start) - +new Date(b.Start));
          // ...
          items = items.filter(
            (a) =>
              +this.getMonday(today) > +new Date(a.Start) &&
              +new Date(a.Start) <= +new Date(endDate)
          );
        });
        callback(items);
      },
      {
        onlyOnce: true,
      }
    );
  }

  getMonday(d: Date) {
    d = new Date(d);
    var day = d.getDay(),
      diff = d.getDate() - day + (day == 0 ? -6 : 1); // adjust when day is sunday
    return new Date(d.setDate(diff));
  }
}

export interface CalendarItem {
  CalendarName: string;
  CalendarId: string;
  CustomDescription: string;
  EndTime: Date;
  IsAllDay: false;
  IsCustomDateTime: false;
  Location: string;
  Region: string;
  SlackChannelId: string;
  Start: Date;
  StartTime: Date;
  Tag: string;
  Time: string;
  Title: string;
  Type: string;
  Where: string;
}
