import axios from "axios";
import CooKie from "js-cookie";
import nprogress from "nprogress";
import { Modal } from 'antd';


export const getCookie = k => CooKie.get(k);
export const delCookie = k => CooKie.remove(k);
export const setCookie = (k, v) => CooKie.set(k, v);

export const AUTH_HEADERS = "Authorization";
export const XSRF_TOKEN_KEY = "X-XSRF-TOKEN";
export const AUTH_TOKEN_KEY = "x-auth-token";
export const CONTENT_TYPE = {
	URL: "application/x-www-form-urlencoded",
	JSON: "application/json; charset=utf-8",
	FORM: "multipart/form-data",
};
export const apiDomain = process.env.NODE_ENV == 'development' ? '' : '';
const loginHref = process.env.NODE_ENV == 'development' ? '/#/login' : '/paiban/#/login';

jQuery.support.cors = true;
// jquery全局请求控制
$.ajaxSetup({
	timeout: 15000,
	cache:false,
	beforeSend: xhr => {
		// xhr.setRequestHeader('token',getCookie(AUTH_TOKEN_KEY))
	},
	complete: function (XMLHttpRequest, textStatus) {
		if(textStatus == 'error'){
			return setCookie
		}
		let old = getCookie('AUTH_TOKEN_KEY');
		// console.log('old token：' + old)
		let token = XMLHttpRequest.getResponseHeader('token');
		// console.log('new token：' + token)
		// console.log('token' + token == old ? '没变' : '更新了');
		if(token){
			setCookie('AUTH_TOKEN_KEY',token)
		}
		let code = XMLHttpRequest.responseJSON ? XMLHttpRequest.responseJSON.status : '';
		switch (code) {
			case 400104:
				if(old){
					Modal.warning({
						title: '权限不足',
						content: '账号权限不足，请重新登录！',
						okText: '前往登录',
						onOk: () => {
							window.location.href = loginHref
						}
					});
				}else{
					Modal.warning({
						title: '请登录',
						content: '您还没有登录，请前往登录',
						okText: '前往登录',
						onOk: () => {
							window.location.href = loginHref
						}
					});
				}
				break;
			case 400100:
				if(old){
					Modal.warning({
						title: '权限不足',
						content: '账号权限不足，请重新登录！',
						okText: '前往登录',
						onOk: () => {
							window.location.href = loginHref
						}
					});
				}else{
					Modal.warning({
						title: '请登录',
						content: '您还没有登录，请前往登录',
						okText: '前往登录',
						onOk: () => {
							window.location.href = loginHref
						}
					});
				}
				
				break;
			case 400102:
				Modal.warning({
					title: '登录过期',
					content: '请前往登录页重新登录。',
					okText: '前往登录',
					onOk: () => {
						window.location.href = loginHref
					}
				});
				break;
				case 400101:
				Modal.warning({
					title: '登录过期',
					content: '请前往登录页重新登录。',
					okText: '前往登录',
					onOk: () => {
						window.location.href = loginHref
					}
				});
				break;
			default:
				break;
		}
	}
		
});
$(document).ajaxComplete(
	(event, xhr, options) => xhr.always(
		(data, status, xhr) => {
			switch (status) {
				case "abort":
				case "error":
				case "nocontent":
				case "notmodified":
				case "parsererror":
				case "success":
				case "timeout":
				default:
			}
		}
	)
);
// jquery常用请求封装
export const $get = (url, data, type = "GET", dataType = "JSON") => $.ajax({
	url: apiDomain + url, data, type, dataType,
	headers: {
		'content-type': CONTENT_TYPE.JSON,
		'token': getCookie('AUTH_TOKEN_KEY')
	}
});
	
		
export const $post =
	// data 为json对象
	(url, data, type = "POST", dataType = "JSON") =>
		$.ajax({
			url: apiDomain + url, 
			type, 
			dataType,
			data: JSON.stringify(data),
			headers: {
				'content-type': CONTENT_TYPE.JSON,
				'token': getCookie('AUTH_TOKEN_KEY')
			}
		});
export const $form =
	// data 为FormData对象
	(url, data, type = "POST", dataType = "JSON") =>
		$.ajax({
			url, data, type, dataType,
			processData: false,
			contentType: false,
		});

// 创建axios请求实例
export const service = axios.create({
	validateStatus: status => true,
	baseURL: "/rest",
	timeout: 15000,
});
/*
service.defaults.headers.get["Content-Type"] = CONTENT_TYPE.URL;
service.defaults.headers.put["Content-Type"] = CONTENT_TYPE.URL;
service.defaults.headers.post["Content-Type"] = CONTENT_TYPE.URL;
service.defaults.headers.delete["Content-Type"] = CONTENT_TYPE.URL;
service.defaults.headers.common[AUTH_TOKEN_KEY] = AUTH_TOKEN_KEY;
*/
// request拦截器
service.interceptors.request.use(
	config => {
		// 在发送请求时执行函数,headers携带token,请根据实际情况自行修改
		config.headers[AUTH_TOKEN_KEY] = getCookie(AUTH_TOKEN_KEY);
		return config;
	},
	error => {
		// eslint-disable-next-line no-console
		console.log("interceptors.request.error"); console.dir(error);
		return Promise.reject(error);
	}
);
// respone拦截器
service.interceptors.response.use(
	response => {
		// validateStatus函数判true时响应处理函数,返回值传给promise.resolve,请根据实际情况自行修改
		// eslint-disable-next-line no-console
		console.log("interceptors.response"); console.dir(response);
		/*response = {
			data: {} || "", // `data` 给服务器发送请求的响应数据信息
			status: 200, // `status` 给服务器发送请求的响应 HTTP 状态码
			statusText: "OK", // `statusText` 给服务器发送请求的响应 HTTP 状态信息
			headers: {}, // `headers` 给服务器发送请求的响应 HTTP 响应头
			config: {}, // `config` 给服务器发送请求的配置信息
			request: {}, // `request` 给服务器发送请求的请求信息
		};*/
		const { headers, status } = response || {};
		const token = headers && headers[AUTH_TOKEN_KEY];
		token && setCookie(AUTH_TOKEN_KEY, token);
		return /^2\d+|304$/.test(status)
			? Promise.resolve(response)
			: Promise.reject(response);
	},
	error => {
		// validateStatus函数判false时响应处理函数,返回值传给promise.reject,请根据实际情况自行修改
		/*error = {
			message: "", // `message` 给服务器发送请求的响应错误标题
			response: {}, // `headers` 给服务器发送请求的响应信息
			request: {}, // `request` 给服务器发送请求的请求信息
			config: {}, // `config` 给服务器发送请求的配置信息
		};*/
		// eslint-disable-next-line no-console
		console.log("interceptors.response.error"); console.dir(error);
		return Promise.reject(error);
	}
);
// axios常用请求封装 https://github.com/axios/axios#request-method-aliases
// service.get/delete/head/options(url, { params, headers });
// service.post/put/patch(url, data, { params, headers });

// 权限检查
export const permission = route => Promise.resolve(route).then(v => {
	const login = true;
	const auth = true;
	const history = { push() { } };
	if (!login) {
		// 检查到未登录 跳转到登陆页
		const from = route.path || route.from || "/";
		history.push({
			pathname: "/login",
			search: "?from=" + from,
			state: { from },
		});
	} else if (auth) {
		// 权限检查通过 跳转对应页面
		return route.component;
	}
	const Page403 = props => null;
	// 页面不显示, 改成显示 403 页面, 即提示无权限页面, 地址不跳转
	return Page403;
});

// 路由控制
export const router = {
	beforeEach: v => v,
	afterEach: v => v,
};
router.beforeEach(
	(to, from, next) => {
		nprogress.start();
		const login = true;
		if (login) {
			next();
		} else {
			next("/login");
			nprogress.done();
		}
	});
router.afterEach(
	(to, from) => nprogress.done()
);