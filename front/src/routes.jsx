import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { HomePage } from "./components/pages/HomePage";
import { EventsPage } from "./components/pages/EventsPage";
import { EventDetailPage } from "./components/pages/EventDetailPage";
import { ProfilePage } from "./components/pages/ProfilePage";
import { AdminPage } from "./components/pages/AdminPage";
import { NotFound } from "./components/pages/NotFound";
export const router = createBrowserRouter([
    {
        path: "/",
        Component: Root,
        children: [
            { index: true, Component: HomePage },
            { path: "events", Component: EventsPage },
            { path: "events/:id", Component: EventDetailPage },
            { path: "profile", Component: ProfilePage },
            { path: "admin", Component: AdminPage },
            { path: "*", Component: NotFound },
        ],
    },
]);
