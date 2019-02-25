import React, { Component } from "react";
import { $post, setCookie } from "../../utils/auth";
import { withRouter } from "react-router-dom";
import "./style.less";
import { Form, Input, message, Modal } from 'antd';
const FormItem = Form.Item;
const createForm = Form.create;


class Login extends Component {
    handleOk = () => {
        this.props.form.validateFields((errors, values) => {
            if (!!errors) {
                return;
            } else {
                $post( "/paiban/api/v1/login", values).done(res => {
                    if(res.status == 200){
                        setCookie('AUTH_TOKEN_KEY', res.body.token);
                        setCookie('roleList', JSON.stringify(res.body.roleList));
                        setCookie('userName', res.body.userName);
                        setCookie('userId', res.body.userId);
                        message.success(res.body.userName + ',欢迎使用排班系统！');
                        this.props.history.push("/dutycalendar");
                        setTimeout(() => {
                            window.location.reload()
                        },0)
                    }else{
                        message.error(res.msg);
                    }
                })
            }
        });
        
    }
    render() {
        const { getFieldProps } = this.props.form;
        const nameProps = getFieldProps('loginName', {
			validate: [{
				rules: [{
					required: true,
					message: '请输入账号'
				}],
				trigger: ['onBlur']
			}]
        });
        const passwordProps = getFieldProps('password', {
			validate: [{
				rules: [{
					required: true,
					message: '请输入密码'
				}],
				trigger: ['onBlur']
			}]
        });
        return <Modal wrapClassName="bg" title="登录" visible={true} onOk={this.handleOk} closable={false}>
            <Form horizontal onSubmit={this.handleSubmit}>
            <FormItem label="账户" >
                <Input {...nameProps} placeholder="请输入账户名" />
            </FormItem>
            <FormItem label="密码" >
                <Input {...passwordProps} type="password" placeholder="请输入密码" />
            </FormItem>
        </Form> 
      </Modal>
    }
}

export default createForm({withRef: true })(withRouter(Login))