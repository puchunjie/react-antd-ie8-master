import { getCookie } from "../utils/auth";

const roleList = getCookie('roleList') ? JSON.parse(getCookie('roleList')) : [];
const isAdmin = roleList && roleList.some(item => item.name == 'admin');
export const NAV_MENU = isAdmin ? [{
		key: "/dutycalendar"
	},
	{
		key: "/typesetplan"
	},
	{
		key: "/dutyschedule"
	},
	{
		key: "/usermange",
	},
	{
		key: "/vacation",
	}
] : [{
	key: "/dutycalendar"
},
{
	key: "/typesetplan"
},
{
	key: "/dutyschedule"
}];
export const NAV_URLS = isAdmin ? {
	"/dutycalendar": {
		label: "值班日历",
		icon: "home",
		type: "link"
	},
	"/typesetplan": {
		label: "排班计划",
		icon: "smile",
		type: "link"
	},
	"/dutyschedule": {
		label: "值班统计",
		icon: "notification",
		type: "link"
	},
	"/usermange": {
		label: "员工管理",
		icon: "appstore",
		type: "link"
	},
	"/vacation": {
		label: "年休假配置",
		icon: "appstore",
		type: "link"
	}
} : {
	"/dutycalendar": {
		label: "值班日历",
		icon: "home",
		type: "link"
	},
	"/typesetplan": {
		label: "排班计划",
		icon: "smile",
		type: "link"
	},
	"/dutyschedule": {
		label: "值班统计",
		icon: "notification",
		type: "link"
	}
};