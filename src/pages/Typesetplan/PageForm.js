import React, { Component } from "react";
import df from 'dateformat-util'
import { $post, $get } from "../../utils/auth";
import { NAMES } from '../../utils/configs'
import "./style.less";
import { DatePicker, Button, Select, message, Modal, Form, Input, InputNumber, Tag, Popover, Transfer } from "antd";
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

    disabledDate = (value) => {
        return value.time < (new Date().getTime() - (24*60*60*1000))
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
		// const leaderNumProps = getFieldProps('leaderNum', {
		// 	validate: [{
		// 		rules: [{
		// 			required: true,
		// 			message: '请输入人数'
		// 		}],
		// 		trigger: ['onChange']
		// 	}]
		// });
		// const employeeNumProps = getFieldProps('employeeNum', {
		// 	validate: [{
		// 		rules: [{
		// 			required: true,
		// 			message: '请输入人数'
		// 		}],
		// 		trigger: ['onChange']
		// 	}]
        // });
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
                        <RangePicker disabledDate={this.disabledDate} {...rangDateProps} />
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
        targetKeys: [],
        activeUser: {},
        activeIndex: null,
        leaderNum: '1',
        employeeNum: '1',
        errTip: '',
        tipDesc: '',
        needLear: 0,
        needStaff: 0,
        NAMES: NAMES,
        titles: [NAMES.leader,NAMES.staff ]
    };
     // 打开排班计划面板
	showModal = () => {
		this.setState({addShow: true})
    }
    modalCancel = () => {
        this.refs.form.resetFields();
        this.setState({addShow: false,step1: true, params: {},selecteds: [], targetKeys: []})
    }

    
    modalOk = () => {
        this.refs.form.validateFields((errors, values) => {
			if (!!errors) {
				return false;
			}else{
                let { belongName, name, rangDate, planUsers,belongId,belongOldName } = values;
                planUsers = planUsers.map(item => {
                    return {
                        ...item,
                        uuid: item.code + '_' + item.text,
                        label: item.text + (item.attributes.atdUserType == 100 ? `  (${NAMES.leader})` : `  (${NAMES.staff})`)
                    }
                })
                let params = {
                    belongId: belongName == belongOldName ? belongId : undefined,
                    belongName,
                    name,
                    leaderNum: 0,
                    employeeNum: 0,
                    beginDate: df.format(rangDate[0], 'yyyy-MM-dd'),
                    endDate: df.format(rangDate[1], 'yyyy-MM-dd'),
                    planUsers: [],
                    planVacations: []

                }   
                // 自动计算出合适的人员分配
                let days = this.datedifference(params.beginDate,params.endDate);
                let staff = planUsers.filter(item => item.attributes.atdUserType == 101).map(item => item.uuid).length;
                let leader = planUsers.length - staff;
                let obj = this.computedMothod(leader,staff,days);
                let targetKeys = planUsers.filter(item => item.attributes.atdUserType == 101).map(item => item.uuid);


                if(leader > obj.needLear){
                    let leaderKeys = planUsers.filter(item => item.attributes.atdUserType == 100).map(item => item.uuid);
                    let bianzhiNum = leader - obj.needLear;
                    let bianzhi = leaderKeys.filter((item,i) => i > (leaderKeys.length - 1 - bianzhiNum));
                    leaderKeys.length = leaderKeys.length - bianzhiNum;
                    targetKeys.push(...bianzhi);
                }

                
                this.setState({ 
                    step1: false,
                    params,
                    selecteds: planUsers,
                    targetKeys,
                    ...this.computedMothod(leader,staff,days)
                })
            }
            
		});
    }


    datedifference = (sDate1, sDate2) => {    //sDate1和sDate2是2006-12-18格式  
        var dateSpan,
            tempDate,
            iDays;
        sDate1 = Date.parse(sDate1);
        sDate2 = Date.parse(sDate2);
        dateSpan = sDate2 - sDate1;
        dateSpan = Math.abs(dateSpan);
        iDays = Math.floor(dateSpan / (24 * 3600 * 1000));
        return iDays + 1
    };

    // 计算公式
    computedMothod = (leader = 0, staff = 0, days = 0) => {
        let leaderEveryDay = parseInt(leader/days);
        let overLeader = leader%days;
        let staffEveryDay = Math.ceil((staff + overLeader)/days);
        let leaderTip = '',staffTip= '';

        if(leaderEveryDay < 1){
            leaderTip = this.state.NAMES.leader + "人数不足"
        }
        // 如果计算出的值班干部数=0，提示"干部人数不足"
        if(staffEveryDay < 1){
            staffTip = this.state.NAMES.staff + '人数不足'
        }
        //干部数=1，干部数 * 值班天数 > 选择的值班干部数，提示"干部人数不足"
        if(staffEveryDay == 1 && (staffEveryDay * days) > staff){
            staffTip = this.state.NAMES.staff + '人数不足'
        }
        //干部数>1，（干部数-1）* 值班天数 > 选择的值班干部数，提示"干部人数不足"
        if(staffEveryDay > 1 && ((staffEveryDay - 1) * days) > staff){
            staffTip = this.state.NAMES.staff + '人数不足'
        }


        let outLeader = leaderEveryDay < 1 ? 1 : leaderEveryDay;
        let outStaff = staffEveryDay < 1 ? 1 : staffEveryDay;
        let needTotalStaff = outStaff > 1 ? ((outStaff - 1) * days) + 1 : outStaff * days;
        return {
            leaderNum: String(outLeader), //每日值班领导数
            employeeNum: String(outStaff), //每日值班干部数
            errTip: (leaderTip + staffTip) == '' ? '' : `(${leaderTip}${staffTip})`,
            tipDesc: `每日${this.state.NAMES.leader}：${outLeader}人，每日${this.state.NAMES.staff}：${outStaff}人,(至少需要${this.state.NAMES.leader}：${outLeader * days}人、${this.state.NAMES.staff}：${needTotalStaff}人)   `,
            needLear: outLeader * days,
            needStaff: needTotalStaff
        }
    }

    changeComputed = (leaderNum,employeeNum) => {
        let days = this.datedifference(this.state.params.beginDate,this.state.params.endDate)
        let needLear = leaderNum * days;
        let needStaff = employeeNum > 1 ? (employeeNum - 1) * days + 1 : days;
        return {
            needLear,
            needStaff,
            tipDesc: `每日${this.state.NAMES.leader}：${leaderNum}人，每日${this.state.NAMES.staff}：${employeeNum}人,(至少需要${this.state.NAMES.leader}：${needLear}人、${this.state.NAMES.staff}：${needStaff}人)   `,
        }
    }

    goBack = () => {
        this.setState({ step1: true });
    }

    // 添加计划
    addPlane = params => {
        // 人数是否满足
        let staffNum = this.state.targetKeys.length;
        let leaderNum = this.state.selecteds.length - staffNum;
        if(leaderNum < this.state.needLear || staffNum < this.state.needStaff){
            message.error('人员不满足要求，请按提示手动调整');
            return 
        }

        let p = JSON.parse(JSON.stringify(params));
        p.leaderNum = p.leaderNum == null ? this.state.leaderNum : p.leaderNum;
        p.employeeNum = p.employeeNum == null ? this.state.employeeNum : p.employeeNum;
        p.planUsers = this.state.selecteds.map(item => {
            return {
                userId: item.code,
                userType: this.state.targetKeys.some(e => e == item.code + '_' + item.text) ? 101 : 100
            }
        })

        this.setState({loading: true})
        $post('/paiban/api/atd/attendance-plan/v1/add',p).done(res => {
			if(res.status == 200){
                this.modalCancel();
                this.props.GetList()
                message.success('添加成功');
			}else{
                message.error(res.msg);
            }
		}).always( () => {
            this.setState({loading: false})
        })
    }


    // employeeChange = e =>{
    //     this.setState({
    //         employeeNum: e.target.value,
    //         ...this.changeComputed()
    //     })
    // }

    // leaderNum = e =>{
    //     this.setState({
    //         leaderNum: e.target.value
    //     })
    // }

    // 提交计划表单
    submitPlan = () => {
        this.refs.form.validateFields((errors, values) => {
            if(!errors){
                let { belongName, name, rangDate, planUsers,belongId,belongOldName } = values;
                let params = {
                    belongId: belongName == belongOldName ? belongId : undefined,
                    belongName,
                    name,
                    leaderNum: Number(this.leaderNum),
                    employeeNum: Number(this.employeeNum),
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

    renderItem = (item) => {
        return {
            label: item.label,  // for displayed item
            value: item.uuid,   // for title and filter matching
        };
      }

    transferChange = (targetKeys, direction, moveKeys) => {
        this.setState({ targetKeys });
    }

    leaderChange = value => {
        this.setState({
            leaderNum: value,
            ...this.changeComputed(value,this.state.employeeNum)
        })
    }

    employeeChange = value => {
        this.setState({
            employeeNum: value,
            ...this.changeComputed(this.state.leaderNum,value)
        })
    }
    
    render() {
        const formItemLayout = {
			labelCol: {
				span: 5
			},
			wrapperCol: {
				span: 17
			},
        };
        return <div>
                <Button type="primary" className="add-btn" onClick={this.showModal}>添加排班计划</Button>
                <Modal ref="modal" width={ 1100 } visible={this.state.addShow} 
                title={ !this.state.step1 ? '添加排期计划' : '添加排期计划' } closable={false}
                footer={[
                    <Button key="cancel" type="ghost" size="large" onClick={this.modalCancel}>取 消</Button>,
                    <Button className={!this.state.step1 ? 'hide': '' } key="next" type="primary" size="large" onClick={this.modalOk}>
                      下一步
                    </Button>,
                    <Button className={this.state.step1 ? 'hide': '' } key="back" type="primary" size="large" onClick={this.goBack}>
                    上一步
                    </Button>,
                    <Button className={this.state.step1 ? 'hide': '' } key="submit" type="primary" size="large" loading={this.state.loading} onClick={this.submitPlan}>
                      添加并排班
                    </Button>
                  ]}>
                    <div className={!this.state.step1 ? 'hide': '' }>
                    {
                        this.state.addShow ? <PageForm ref="form"/> : ''
                    }
                    </div>
                    <div className={this.state.step1 ? 'hide': '' }>
                    {
                        this.state.addShow ? <Form>
                        <span style={{display:'block',width:'100%',textAlign:'center',color:'red'}}>
                        { this.state.tipDesc  }
                        </span>
                    <FormItem
                        {...formItemLayout}
                        label={ '每日值班' + this.state.NAMES.leader + '数'}
                        hasFeedback
                    >
                        <Select value={this.state.leaderNum} onChange={this.leaderChange} style={{ width: 650 }}>
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
                        label={ '每日值班' + this.state.NAMES.staff + '数'}
                        hasFeedback
                    >
                        <Select value={this.state.employeeNum} onChange={this.employeeChange} style={{ width: 650 }}>
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
                        label="调整人员"
                        hasFeedback
                    >
                        <Transfer
                            dataSource={this.state.selecteds}
                            rowKey={record => record.uuid}
                            listStyle={{
                            width: 300,
                            height: 300,
                            }}
                            titles={this.state.titles}
                            targetKeys={this.state.targetKeys}
                            onChange={this.transferChange}
                            render={this.renderItem}
                        />
                    </FormItem>
                    </Form> : ''
                    }
                    
                    
                    </div>
			    </Modal>
            </div>
    }
}

export default out; 