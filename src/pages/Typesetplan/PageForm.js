import React, { Component } from "react";
import df from 'dateformat-util'
import { $post, $get } from "../../utils/auth";
import "./style.less";
import { DatePicker, Button, Select, message, Modal, Form, Input, InputNumber, Tag, Popover } from "antd";
import UserTree from '../../components/UserTree'
const Option = Select.Option;
const RangePicker = DatePicker.RangePicker;
const createForm = Form.create;
const FormItem = Form.Item;

class PageForm extends Component {
    state = {
        options: [],
        visible: false
    }
    // 获取计划归属
	getBelongIds = () => {
		$get('/paiban/api/atd/attendance-plan-belong/v1/search').done(res => {
            if(res.status == 200){
                let ops = res.body.map(item => {
                    return {
                        id: String(item.id),
                        name: item.name
                    }
                })
                this.setState({
                    options: ops
                })
            }
		})
    }

    showChoise = (item) => {
        this.props.form.setFieldsValue({ belongName: item.name, belongId: item.id, belongOldName: item.name })
        this.setState({
            visible: false
        });
    }

    handleVisibleChange = (visible) => {
        this.setState({
            visible
        });
    }
    
    componentDidMount(){
        this.getBelongIds();
        this.props.form.setFieldsValue({ 
            leaderNum: '1',
            employeeNum: '2'
        })
    }
	render() {
		const {
			getFieldProps,
            getFieldError,
			isFieldValidating
		} = this.props.form;
		const belongNameProps = getFieldProps('belongName', {
			validate: [{
				rules: [{
					required: true,
					message: '请输入或选择计划归属'
				}],
				trigger: ['onBlur']
			}]
        });
        const belongIdProps = getFieldProps('belongId');
        const belongOldProps = getFieldProps('belongOldName');
		const nameProps = getFieldProps('name', {
			validate: [{
				rules: [{
					required: true,
					message: '请输入计划名称'
				}],
				trigger: ['onBlur']
			}]
		});
		const rangDateProps = getFieldProps('rangDate', {
			validate: [{
				rules: [{
					required: true,
					message: '请选择时间段'
				}],
				trigger: ['onChange']
			}]
		});
		const leaderNumProps = getFieldProps('leaderNum', {
			validate: [{
				rules: [{
					required: true,
					message: '请输入人数'
				}],
				trigger: ['onChange']
			}]
		});
		const employeeNumProps = getFieldProps('employeeNum', {
			validate: [{
				rules: [{
					required: true,
					message: '请输入人数'
				}],
				trigger: ['onChange']
			}]
        });
        const planUsersProps = getFieldProps('planUsers', {
            rules: [{
                    required: true,
                    message: '请选择人员！'
                }
            ]
        });
		const formItemLayout = {
			labelCol: {
				span: 5
			},
			wrapperCol: {
				span: 17
			},
        };
        
        const tags = () => {
            let tags = this.props.form.getFieldValue('planUsers') !== undefined ? this.props.form.getFieldValue('planUsers')[0] : [];
            return tags.map((tag,i) => {
                return <Tag key={i}>{tag.text}</Tag>
            })
            
        }

        const menu = () => {
            return <div>
                    {
                    this.state.options.map((item,i) => <a key={i} style={ { display:'block'}} onClick={this.showChoise.bind(this,item)}>{item.name}</a>)
                    }
                </div>
        }
        
		return (
            <Form horizontal>
                    <FormItem {...formItemLayout} label="值班计划归属" style={{display:'none'}}>
                        <Input {...belongIdProps} style={{ width:650 }} placeholder="请输入" />
                        <Input {...belongOldProps} style={{ width:650 }} placeholder="请输入" />
                    </FormItem>
                    <FormItem
                        {...formItemLayout} label="值班计划归属" hasFeedback 
                        help={isFieldValidating('name') ? '校验中...' : (getFieldError('name') || []).join(', ')}>
                        <Input {...belongNameProps} style={{ width:650 }} placeholder="请输入" />
                        <Popover content={menu()} title="选择归属" trigger="click" visible={this.state.visible} onVisibleChange={this.handleVisibleChange}>
                            <Button style={{marginLeft:10}} type="primary">选择</Button>
                        </Popover>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="值班计划名称"
                        hasFeedback
                    >
                        <Input {...nameProps} type="text" style={{ width:650 }} placeholder="请输入" />
                    </FormItem>
            
                    <FormItem
                        {...formItemLayout}
                        label="时间范围"
                        hasFeedback
                    >
                        <RangePicker {...rangDateProps} />
                    </FormItem>
            
                    <FormItem
                        {...formItemLayout}
                        label="每日值班领导数"
                        hasFeedback
                    >
                        <Select {...leaderNumProps} style={{ width: 650 }}>
                            <Option key="1" value="1">1人</Option>
                            <Option key="2" value="2">2人</Option>
                            <Option key="3" value="3">3人</Option>
                            <Option key="4" value="4">4人</Option>
                            <Option key="5" value="5">5人</Option>
                            <Option key="6" value="6">6人</Option>
                            <Option key="7" value="7">7人</Option>
                            <Option key="8" value="8">8人</Option>
                        </Select>
                    </FormItem>
            
                    <FormItem
                        {...formItemLayout}
                        label="每日值班干部数"
                        hasFeedback
                    >
                        <Select {...employeeNumProps} style={{ width: 650 }}>
                            <Option key="1" value="1">1人</Option>
                            <Option key="2" value="2">2人</Option>
                            <Option key="3" value="3">3人</Option>
                            <Option key="4" value="4">4人</Option>
                            <Option key="5" value="5">5人</Option>
                            <Option key="6" value="6">6人</Option>
                            <Option key="7" value="7">7人</Option>
                            <Option key="8" value="8">8人</Option>
                        </Select>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="参与值班人员"
                        hasFeedback
                    >
                        <div style={{ width:650 }}><UserTree {...planUsersProps} /></div>
                    </FormItem>
                    </Form>
		  );


	}
}

PageForm = createForm({withRef: true })(PageForm)
class out extends Component {
    state = {
        addShow: false,
        loading: false,
        step1: true,
        holdayShow: false,
        params: {},
        selecteds: [],
        activeUser: {},
        activeIndex: null,
    };
     // 打开排班计划面板
	showModal = () => {
		this.setState({addShow: true})
    }
    modalCancel = () => {
        this.setState({addShow: false,step1: true, params: {},selecteds: []})
        this.refs.form.resetFields();
    }

    
    modalOk = () => {
        this.refs.form.validateFields((errors, values) => {
			if (!!errors) {
				return false;
			}else{
                let { belongName, name, leaderNum, employeeNum, rangDate, planUsers,belongId,belongOldName } = values;
                let params = {
                    belongId: belongName == belongOldName ? belongId : undefined,
                    belongName,
                    name,
                    leaderNum: Number(leaderNum),
                    employeeNum: Number(employeeNum),
                    beginDate: df.format(rangDate[0], 'yyyy-MM-dd'),
                    endDate: df.format(rangDate[1], 'yyyy-MM-dd'),
                    planUsers: planUsers.map(item => {
                        return {
                            userId: Number(item.code),
                            userType: item.attributes.atdUserType
                        }
                    }),
                    planVacations: []

                }
                let users = planUsers.map(item => {
                    let data = this.state.selecteds.find(el => el.id == item.id)
                    if (data) {
                        return data
                    } else {
                        return {
                            ...item,
                            selected: false,
                            days: []
                        }
                    }
                });
                
                this.setState({ 
                    step1: false,
                    params,
                    selecteds: users
                })
            }
            
		});
    }

    goBack = () => {
        this.setState({ step1: true });
    }

    // 添加计划
    addPlane = params => {
        this.setState({loading: true})
        $post('/paiban/api/atd/attendance-plan/v1/add',params).done(res => {
			if(res.status == 200){
                this.setState({addShow: false,step1: false});
                this.refs.form.resetFields();
                this.props.GetList()
                message.success('添加成功');
			}else{
                message.error(res.msg);
            }
		}).always( () => {
            this.setState({loading: false})
        })
    }

    tagClick = (data,i) => {
        this.setState({
            activeUser: data,
            activeIndex: i,
            holdayShow: true
        })
    }

    addDay = (value, dateString) => {
        let days = this.state.activeUser.days || [];
        days.push(dateString);
        let activeUser = Object.assign({ days:days },this.state.activeUser)
        this.setState({
            activeUser
        })
    }

    delDay = i => {
        let days = this.state.activeUser.days || [];
        days.splice(i,1);
        let activeUser = Object.assign({ days:days },this.state.activeUser);
        this.setState({
            activeUser
        });
    }

    dayOff = () => {
        this.setState({
            holdayShow: false,
            activeIndex: null,
            activeUser: {}
        })
    }

    holdayOk = () => {
        let selecteds = JSON.parse(JSON.stringify(this.state.selecteds));
        selecteds[this.state.activeIndex] = this.state.activeUser;
        this.setState({
            selecteds,
            holdayShow: false,
            activeIndex: null,
            activeUser: {}
        })
    }

    // 提交计划表单
    submitPlan = () => {
        this.refs.form.validateFields((errors, values) => {
            if(!errors){
                let { belongName, name, leaderNum, employeeNum, rangDate, planUsers,belongId,belongOldName } = values;
                let params = {
                    belongId: belongName == belongOldName ? belongId : undefined,
                    belongName,
                    name,
                    leaderNum: Number(leaderNum),
                    employeeNum: Number(employeeNum),
                    beginDate: df.format(rangDate[0], 'yyyy-MM-dd'),
                    endDate: df.format(rangDate[1], 'yyyy-MM-dd'),
                    planUsers: planUsers.map(item => {
                        return {
                            userId: Number(item.code),
                            userType: item.attributes.atdUserType
                        }
                    }),
                    planVacations: []

                }
                this.addPlane({
                    ...params
                })
            }
		});
        
    }
    
    render() {
        return <div>
                <Button type="primary" className="add-btn" onClick={this.showModal}>添加排班计划</Button>
                <Modal ref="modal" width={ 1100 } visible={this.state.addShow} 
                title={ !this.state.step1 ? '添加排期计划' : '添加排期计划' } closable={false}
                footer={[
                    <Button key="cancel" type="ghost" size="large" onClick={this.modalCancel}>取 消</Button>,
                    // <Button className={!this.state.step1 ? 'hide': '' } key="next" type="primary" size="large" onClick={this.modalOk}>
                    //   下一步
                    // </Button>,
                    // <Button className={this.state.step1 ? 'hide': '' } key="back" type="primary" size="large" onClick={this.goBack}>
                    // 上一步
                    // </Button>,
                    <Button key="submit" type="primary" size="large" loading={this.state.loading} onClick={this.submitPlan}>
                      添加并排班
                    </Button>
                  ]}>
                  <PageForm ref="form"/>
                    {/* <div className={!this.state.step1 ? 'hide': '' }><PageForm ref="form"/></div>
                    <div className={this.state.step1 ? 'hide': '' }>
                    {
                        // onClick={this.tagClick.bind(this,tag,i)}
                        this.state.selecteds.map((tag,i) => <Tag key={i} color={tag.days.length>0 ? 'red' : ''}>
                        { tag.text } { tag.days.length > 0 ? `(${tag.days.length}天)` : '' }</Tag>)
                    }
                    </div> */}
			    </Modal>
                
                {/* <Modal title="添加休假"  visible={this.state.holdayShow} onOk={this.holdayOk} onCancel={this.dayOff}>
                    {
                        this.state.activeUser.days && this.state.activeUser.days.map((day,i) => {
                            return <div key={i} style={{marginBottom:10}}><DatePicker value={day} disabled/>&nbsp;&nbsp;&nbsp;
                            <Button type="primary" size="small" onClick={this.delDay.bind(this,i)}>删除</Button></div>
                        })
                    }
                    <DatePicker value='' onChange={this.addDay}/>
                </Modal> */}

                
            </div>
    }
}

export default out; 