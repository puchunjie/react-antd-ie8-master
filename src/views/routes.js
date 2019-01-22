import React from "react";
import { Spin } from "antd";

import Dutycalendar from "bundle-loader?lazy&name=home!../pages/Dutycalendar/index";
import Typesetplan from "bundle-loader?lazy&name=home!../pages/Typesetplan/index";
import Dutyschedule from "bundle-loader?lazy&name=home!../pages/Dutyschedule/index";
import UserMange from "bundle-loader?lazy&name=home!../pages/UserMange/index";
import Login from "bundle-loader?lazy&name=home!../pages/Login/index";
import Vacation from "bundle-loader?lazy&name=home!../pages/Vacation/index";
import { bundle } from "../components/Bundle";

const Empty = props => <div><Spin />Loading</div>;
const NoAu = props => <div><Spin />法海不懂爱, 页面出不来...</div>;
const DutyC = bundle(Empty, Dutycalendar, { type: "callback" });
const TypeS = bundle(Empty, Typesetplan, { type: "callback" });
const DutyS = bundle(Empty, Dutyschedule, { type: "callback" });
const UserM = bundle(Empty, UserMange, { type: "callback" });
const Logind = bundle(Empty, Login, { type: "callback" });
const Vk = bundle(Empty, Vacation, { type: "callback" });
const routes = [
	{ type: "redirect", exact: true, strict: true, from: "/", to: "/dutycalendar" },
	{ type: "route", path: "/login", component: Logind },
	{ type: "route", path: "/dutycalendar", component: DutyC },
	{ type: "route", path: "/typesetplan", component: TypeS },
	{ type: "route", path: "/dutyschedule", component: DutyS },
	{ type: "route", path: "/vacation", component: Vk },
	{ type: "route", path: "/usermange", component: UserM },
	{ type: "route", component: NoAu },
];
export default routes;