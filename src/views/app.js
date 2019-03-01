import React from "react";
import { Router } from "react-router-dom";
import { Row, Col, Popover } from 'antd';
import { getCookie, delCookie } from "../utils/auth";

import { NAV_MENU, NAV_URLS } from "../constants/columns";
import { RouteMenu } from "../components/Menu";
import { RouteList } from "../components/Route";
import history from "../utils/history";
import routes from "./routes";
import "./app.less";

const loginOut = () => {
	delCookie('AUTH_TOKEN_KEY');
	delCookie('roleList');
	delCookie('userName');
	delCookie('userId');
	window.location.href = process.env.NODE_ENV == 'development' ? '/#/login' : '/paiban/#/login';
}

const resetPassword = () => {
	window.location.href = process.env.NODE_ENV == 'development' ? '/#/resetPwd' : '/paiban/#/resetPwd';
}

const nav = (
	<div style={{ textAlign:'center' }}>
		<a onClick={resetPassword}>修改密码</a>
	</div>
)



const App = props =>
	<Router history={history}>
		<Row className="container">
			<Col className="min-100 bk440" span={3}>
				<h2 className="menu-title">排班系统</h2>
				<RouteMenu theme="dark"  defaultOpenKeys={['/system']} mode="inline" menus={NAV_MENU} urls={NAV_URLS} />
			</Col>
			<Col className="min-100" span={21}>
				<div className="header">
					<span>
					欢迎使用：<a className="ant-dropdown-link">
					<Popover content={nav} trigger="hover">
						<span>{getCookie('userName')} </span>
					</Popover>
					</a> | <a onClick={loginOut}>注销</a>
					</span>
				</div>
				<div className="main">
					<RouteList routes={routes} />
				</div>
			</Col>
		</Row>
	</Router>;

export default App;