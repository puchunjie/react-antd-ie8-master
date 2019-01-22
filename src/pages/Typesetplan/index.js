import React, { Component } from "react";
import "./style.less";
import { DatePicker, Button, Spin, Select, Table, Modal, message,Form, Input, Popover } from "antd";
import { $get, $post } from "../../utils/auth";
import PageForm from './PageForm';
const Option = Select.Option;
const confirm = Modal.confirm;
const MonthPicker = DatePicker.MonthPicker;
const FormItem = Form.Item;




class Typesetplan extends Component {
	state = {
		defaultCurrent: 1,
		list: [], //排班表
		userData: [],
		userShow: false,
		vocationShow: false,
		vacations: [],
		loading: false,
		options: [], //计划归属选项
		selectValue: '',
		date: '',
		params: {
			year: null,
			month: null,
			name: '',
			page: 1,
			pageSize: 10
		},
		total: 0
	};

	//获取排班计划列表
	getList = () => {
		this.setState({
			loading: true
		});
		let params = Object.assign({},this.state.params);
		params.belongId = this.state.selectValue;
		$post('/paiban/api/atd/attendance-plan/v1/search', params).done(res => {
			if(res.status == 200){
				this.setState({
					total: res.body.total,
					list: res.body ? res.body.records : []
				})
			}
		}).always(e => this.setState({
			loading: false
		}));
	}
	//选择计划归属
	handleChange = (value) => {
		this.setState({
            selectValue: value
		});
	}

	//输入框搜索
	nameChange = e => {
		let params = Object.assign({}, this.state.params, { name: e.target.value })
		this.setState({
			params: params
		})
	}

	// 年月
	setYear = value => {
		let params = Object.assign({}, this.state.params, { year: value ? value.getFullYear() : value, month: value ? value.getMonth()+1 : value })
		this.setState({
			params,
			date: value
		})
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
				ops.unshift({id: '', name: '全部'})
				this.setState({
					options: ops
				})
			}
		})
	}

	cols = data => {
		let _this = this;
		return [{
			key: "1",
			dataIndex: 'name',
			title: "排班计划名称"
		},{
			key: "2",
			dataIndex: 'beginDate',
			title: "开始时间"
		},{
			key: "3",
			dataIndex: 'endDate',
			title: "结束时间"
		},{
			key: "4",
			title: "参与人员",
			render: (text, record) => (
				<span>领导：<a onClick={this.showUser.bind(this,record,true)}>{record.leaderCount }</a>人，干部：<a onClick={this.showUser.bind(this,record,false)}>{record.employeeCount}</a>人</span>
			)
		},{
			key: "5",
			title: "休假情况",
			render: (text, record) => (
				<a onClick={this.showVaction.bind(this,record)}>{ record.vacationUserCount ? record.vacationUserCount : 0 }人</a>
			)
		},{
			key: "6",
			dataIndex: 'statusDesc',
			title: "排班状态",
			render: (text, record) => {
				return <Popover content={record.statusDesc} title="排班状态" trigger="hover">
						<span style={{ textAlign:'center' }}>{record.statusDesc}</span>
					</Popover>
			}
		},{
			key: "7",
			title: "操作",
			render: (text, record) => <a onClick={ _this.deletePlane.bind(_this,record) }>删除</a>
		}]
	}

	cols1 = data => {
		return [{
			key: "1",
			dataIndex: 'userName',
			title: "姓名"
		},{
			key: "2",
			dataIndex: 'post',
			title: "职位"
		},{
			key: "3",
			dataIndex: 'email',
			title: "邮箱"
		},{
			key: "4",
			dataIndex: 'phone',
			title: "手机号"
		},{
			key: "5",
			title: "性别",
			render: (text, record) => (
				record.gender == 1 ? '女' : '男'
			)
		}]
	}

	cols2 = data => {
		return [{
			key: "1",
			width: 200,
			dataIndex: 'userName',
			title: "姓名"
		},{
			key: "2",
			dataIndex: 'vacationDates',
			title: "休假日",
			render: (text, record) => {
				return <Popover content={record.vacationDates} title="全部" trigger="hover">
						<span>{record.vacationDates}</span>
					</Popover>
			}
		}]
	}

	//删除计划
	deletePlane = item => {
		let _this = this;
		confirm({
			title: '提示',
			content: '您是否确认要删除这项内容',
			onOk() {
				$post('/paiban/api/atd/attendance-plan/v1/del',{
					planId: item.planId
				}).done(res => {
					if(res.status == 200){
						if(_this.state.list.length <= 1 && _this.state.params.page > 1){
							let params = Object.assign({}, _this.state.params, { page: _this.state.params.page - 1 })
							_this.setState({
								params: params
							})
						}
						message.success('已删除');
						_this.getList();
					}else{
						message.error(res.msg);
					}
				})
			}
		});
		
	}

	//分页信息
	pagination = (total,params) => {
		let _this = this;
		return {
			pageSize: params.pageSize,
			defaultCurrent: params.page,
			total: total,
			onChange(current) {
				let data = Object.assign({}, params, { page: current })
				_this.setState({
					params: data
				})
				_this.getList();
			}
		}
	};

	showUser = (item,isLeader) => {
		$post('/paiban/api/atd/attendance-plan/v1/users', {
			planId: item.planId,
			atdUserType: isLeader ? 100 : 101
		}).done(res => {
			if(res.status == 200){
				this.setState({
					userData: res.body,
					userShow: true,
					defaultCurrent: 1
				})
			}
		})
	}
	
	userHide = () => {
		this.setState({
			userData: [],
			userShow: false
		})
	}
	
	
	showVaction = (item) => {
		if(!item.vacationUserCount) return 
		$post('/paiban/api/atd/attendance-plan/v1/vacations', {
			planId: item.planId
		}).done(res => {
			if(res.status == 200){
				this.setState({
					vocationShow: true,
					vacations: res.body
				})
			}
		})
	}

	vacationHide = () => {
		this.setState({
			vacations: [],
			vocationShow: false
		})
	}

	componentDidMount(){
		this.getBelongIds();
		this.getList();
	}
	render() {
		const { list, loading, options, selectValue, userData,vacations } = this.state;
		return <Spin spinning={ loading}>
			<div className="typesetplan-container">
				<div className="search-header">
					<PageForm GetList={this.getList}/>
					<Form inline onSubmit={this.search}>
						<FormItem label="计划归属">
							<Select value={ selectValue } style={{ width: 200 }} onSelect={this.handleChange}>
								{options.map((option) => {
									return <Option key={ option.id } value={ option.id }>{ option.name }</Option>
								})}
							</Select>
						</FormItem>
						<FormItem label="名称">
							<Input placeholder="计划名称" onChange={this.nameChange} value={this.state.params.name} />
						</FormItem>
						<FormItem label="年月">
							<MonthPicker onChange={this.setYear}/>
						</FormItem>
						<Button type="primary" onClick={this.getList} htmlType="submit">查询</Button>
					</Form>
				</div>
				<Table style={{ marginTop: 20 }} rowKey='planId' bordered dataSource={list} columns={this.cols(list)} 
				pagination={this.pagination(this.state.total,this.state.params)} />
			</div>

			<Modal title="人员" width={800} visible={this.state.userShow} onCancel={this.userHide}
			footer={['']}>
				{
					this.state.userShow ? <Table rowKey='userId' bordered dataSource={userData} columns={this.cols1(userData)} 
					pagination={{total:this.state.userData.length,defaultCurrent: 1}}/> : ''
				}
				
			</Modal>

			<Modal title="休假人员" width={800} visible={this.state.vocationShow} onCancel={this.vacationHide}
			footer={['']}>
				<Table rowKey='userId' bordered dataSource={vacations} columns={this.cols2(vacations)} 
				pagination={{total:this.state.vacations.length}}/>
			</Modal>
			</Spin>;
	};
};

export default Typesetplan;