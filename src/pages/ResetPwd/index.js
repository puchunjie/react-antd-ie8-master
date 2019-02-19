import React, { Component } from "react";
import { $post, setCookie } from "../../utils/auth";
import { withRouter } from "react-router-dom";
import { Form, Input, message, Modal } from 'antd';
const FormItem = Form.Item;
const createForm = Form.create;


class ResetPwd extends Component {
    handleOk = () => {
            this.props.form.validateFields((errors, values) => {
                if (!!errors) {
                    return;
                } else {
                    $post("/paiban/api/user/v1/changePwd", values).done(res => {
                        if (res.status == 200) {
                            delCookie('AUTH_TOKEN_KEY');
                            delCookie('roleList');
                            delCookie('userName');
                            delCookie('userId');
                            window.location.href = process.env.NODE_ENV == 'development' ? '/#/login' : '/paiban/#/login';
                        } else {
                            message.error(res.msg);
                        }
                    })
                }
            });
        
    }

    goback = () => {
        window.history.go(-1)
    }
    render() {
        const { getFieldProps } = this.props.form;

        const nameProps = getFieldProps('oldPassword', {
			validate: [{
				rules: [{
					required: true,
					message: '请输入旧密码'
				}],
				trigger: ['onBlur']
			}]
        });
        const passwordProps = getFieldProps('newPassword', {
			validate: [{
				rules: [{
					required: true,
					message: '请输入新密码'
				}],
				trigger: ['onBlur']
			}]
        });
        return <Modal title="修改密码" visible={true} onOk={this.handleOk} onCancel={this.goback} okText="重置" closable={false}>
            <Form horizontal onSubmit={this.handleSubmit}>
            <FormItem label="旧密码" >
                <Input {...nameProps} placeholder="请输入旧密码" />
            </FormItem>
            <FormItem label="新密码" >
                <Input {...passwordProps} placeholder="请输入新密码" />
            </FormItem>
        </Form> 
      </Modal>
    }
}

export default createForm({withRef: true })(withRouter(ResetPwd))