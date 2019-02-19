import React, { Component } from "react";
import { $post, $get } from "../../utils/auth";
import df from 'dateformat-util'
import { Button, Icon, Spin, Table, Tag, Modal, Form, DatePicker, Input, message, Select, Radio } from "antd";
import "./style.less";
const RangePicker = DatePicker.RangePicker;
const Option = Select.Option;
const createForm = Form.create;
const FormItem = Form.Item;
const confirm = Modal.confirm;
const RadioGroup = Radio.Group;


const createYears = (start = 2018) => {
    let years = [];
    let end = start + 32;
    for(let i = start; i <= end; i++){
        years.push(String(i))
    }
    return years
}

class InForm extends Component {
    state = {
        workingDays: [],
        years: createYears()
    }
    addWork = () => {
        let workingDays = JSON.parse(JSON.stringify(this.state.workingDays));
        workingDays.push({value: ''});
        workingDays = workingDays.map((item,i) => {
            return {
                value: item.value,
                key: i
            }
        })
        this.setState({workingDays})
    }

    wkdChange = (i,date, dateString,e) => {
        let workingDays = JSON.parse(JSON.stringify(this.state.workingDays));
        workingDays[i].value = dateString;
        this.setState({workingDays})
        this.props.form.setFieldsValue({ workingDayList: workingDays.map(item => item.value) })
    }

    componentDidMount(){
        if(this.props.isEdit){
            this.setState({
                workingDays: this.props.item.workingDays.map((item,i) => {
                    return {
                        value: item,
                        key: i
                    }
                })
            })
            this.props.form.setFieldsValue({ 
                workingDayList: this.props.item.workingDays,
                name: this.props.item.name,
                year: this.props.item.year,
                rangDate: [new Date(this.props.item.startDate),new Date(this.props.item.endDate)],
                official: String(this.props.item.official)
            })
        }else{
            this.props.form.setFieldsValue({ workingDayList: this.state.workingDays.map(item => item.value) })
        }
        
    }
    
    render(){
        const {
			getFieldProps,
            setFieldsValue
        } = this.props.form;
        const nameProps = getFieldProps('name', {
			validate: [{
				rules: [{
					required: true,
					message: '请输入名称'
				}],
				trigger: ['onBlur', 'onChange']
			}]
        });
        const yearProps = getFieldProps('year', {
			validate: [{
				rules: [{
					required: true,
					message: '请选择年度'
				}],
				trigger: ['onChange']
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
        const workingDaysProps = getFieldProps('workingDayList');
        const formItemLayout = {
			labelCol: {
				span: 5
			},
			wrapperCol: {
				span: 17
			},
        };

        const radioProps = getFieldProps('official', {
            rules: [
              { required: true, message: '请选择假期性质' },
            ],
          });


        return <Form horizontal ref="test">
            <FormItem
                {...formItemLayout}
                label="假期名称"
                hasFeedback
            >
                <Input {...nameProps} type="text" style={{ width:300 }} placeholder="请输入" />
            </FormItem>
            <FormItem
                {...formItemLayout}
                label="年度"
                hasFeedback
            >
                <Select {...yearProps} style={{ width: 300 }}>
						{this.state.years.map((option) => {
							return <Option key={ option } value={ option }>{ option }</Option>
						})}
				</Select>
                {/* <Input {...yearProps} type="text" style={{ width:300 }} placeholder="请输入年度" /> */}
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
                label="假期性质"
                hasFeedback
            >
                <RadioGroup {...radioProps}>
                    <Radio value="1">法定假期</Radio>
                    <Radio value="0">自定义假期</Radio>
                </RadioGroup>
            </FormItem>
            
            {
                this.state.workingDays.map((item,i) => {
                    return <FormItem key={item.key} {...formItemLayout} label="工作日">
                        <DatePicker value={item.value} onChange={this.wkdChange.bind(this,i)}/>
                    </FormItem>
                })
            }
            <FormItem>
                <Button style={{ float:'right' }} type="primary" onClick={this.addWork}>添加工作日</Button>
            </FormItem>
        </Form>
    }
}

InForm = createForm({withRef: true })(InForm)
class Vacation extends Component { 
    state = {
        loading: false,
        customVacations: [],
        faVacations: [],
        modalShow: false,
        isEdit: false,
        item: {},
        years: createYears(),
        activeYear: String(new Date().getFullYear())
    }

    getList = (year) => {
		this.setState({
			loading: true
		});
		$get('/paiban/api/atd/annual-vacation/v1/list',{
            year: year || this.state.activeYear
        }).done(res => {
			if(res.status == 200){
                let data = res.body.length > 0 ? res.body.map(item => {
                    item.workingDays = item.workingDays == '' ? [] : JSON.parse(item.workingDays)
                    return item
                }) : [];
                let customVacations = data.filter(item => item.official === 0) || [];
                let faVacations = data.filter(item => item.official === 1) || [];
                this.setState({customVacations,faVacations})
			}else{
                message.success(res.msg);
            }
		}).always(e => this.setState({
			loading: false
		}));
    }

    showAdd = () => {
        this.setState({modalShow: true})
    }

    handleOk = () => {
        this.refs.form.validateFields((errors, values) => {
			if (!!errors) {
				return;
			}else{
                const { name,year,workingDayList,rangDate,official } = values;
                let params = {
                    name,
                    year,
                    startDate: df.format(rangDate[0], 'yyyy-MM-dd'),
                    endDate: df.format(rangDate[1], 'yyyy-MM-dd'),
                    workingDayList,
                    official

                }
                if(this.state.isEdit){
                    params.id = this.state.item.id;
                    params.official = this.state.item.official;
                    $post('/paiban/api/atd/annual-vacation/v1/change',params).done(res => {
                        if(res.status == 200){
                            this.getList();
                            this.setState({modalShow: false,isEdit: false,item: {}})
                            message.success('修改成功');
                        }else{
                            message.error(res.msg);
                        }
                    })
                }else{
                    $post('/paiban/api/atd/annual-vacation/v1/add',params).done(res => {
                        if(res.status == 200){
                            this.getList();
                            this.setState({modalShow: false,isEdit: false,item: {}})
                            message.success('添加成功！');
                        }else{
                            message.error(res.msg);
                        }
                    })
                }
                
            }
            
		});
    }

    handleCancel = () =>{
        this.setState({modalShow: false,isEdit: false})
    }

    delete = (item) => {
        confirm({
            title: '您是否确认要删除这项内容',
            okText: '删除',
            onOk: () => {
                $post('/paiban/api/atd/annual-vacation/v1/del', {
                    annualId: item.id
                }).done(res => {
                    if (res.status == 200) {
                        this.getList();
                        message.success('已删除！');
                    } else {
                        message.error(res.msg);
                    }
                })
            }
        });
    }

    modify = (item) => {
        this.setState({modalShow: true,isEdit: true,item: item})
    }

    changeYear = value => {
        this.setState({
            activeYear: value
        })
        this.getList(value)
    }
    
    componentDidMount(){
        this.getList();
    }

    render(){
        const { loading, faVacations, customVacations } = this.state;
        const columns = [{
            title: '假期名称',
            dataIndex: 'name',
            key: '1'
          }, {
            title: '开始时间',
            dataIndex: 'startDate',
            key: '2'
          }, {
            title: '结束时间',
            dataIndex: 'endDate',
            key: '3'
          }, {
            title: '工作日',
            dataIndex: 'endDate',
            key: '4',
            render: (text, record) => (
                record.workingDays.map((day,i) => <Tag key={i}>{day}</Tag>)
            )
          }]
          const columns2 = [{
            title: '假期名称',
            dataIndex: 'name',
            key: '1'
          }, {
            title: '开始时间',
            dataIndex: 'startDate',
            key: '2'
          }, {
            title: '结束时间',
            dataIndex: 'endDate',
            key: '3'
          }, {
            title: '工作日',
            dataIndex: 'endDate',
            key: '4',
            render: (text, record) => (
                record.workingDays.map((day,i) => <Tag key={i}>{day}</Tag>)
            )
          },{
            title: '操作',
            key: '5',
            render: (text, record) => (
                <span>
                  <a onClick={this.modify.bind(this,record)}>修改</a>
                  <span className="ant-divider"></span>
                  <a onClick={this.delete.bind(this,record)}>删除</a>
                </span>
              )
          }]
        
          
        return <Spin spinning={ loading}>
            <div className="vacation-container">
                <div>
                    年度：<Select value={this.state.activeYear} style={{ width: 300 }} onChange={this.changeYear} placeholder="请选择年度">
						{this.state.years.map((option) => {
							return <Option key={ option } value={ option }>{ option }</Option>
						})}
				</Select>
                <Button style={{ float:'right' }} type="primary" onClick={ this.showAdd }>添加</Button>
                </div>
                <h2 style={{ marginBottom:10 }}>法定节假日</h2>
                <Table dataSource={faVacations} bordered columns={columns2} pagination={false}/>
                <h2 style={{ marginBottom:10,marginTop: 30 }}>自定义节假日</h2>
                <Table dataSource={customVacations} bordered columns={columns2} pagination={false}/>
            </div>

            <Modal title={this.state.isEdit ? '修改节假日' : '添加节假日'} visible={this.state.modalShow} 
            okText={this.state.isEdit ? '修改' : '添加'}
            onOk={this.handleOk} onCancel={this.handleCancel} >
                {this.state.modalShow ? <InForm ref="form" isEdit={this.state.isEdit} item={this.state.item}/> : '' }
            </Modal>
        </Spin>;
    }
}



export default Vacation