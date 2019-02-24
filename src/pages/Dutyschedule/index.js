import React, { Component } from "react";
import "./style.less";
import {  Button, Spin, Select, Table,Form, Input } from "antd";
import { $get, $post, getCookie, setCookie } from "../../utils/auth";
const Option = Select.Option;
const FormItem = Form.Item;

class Dutyschedule extends Component {
	state = {
		list: [], //排班表
		loading: false,
		options: [], //计划归属选项
		selectValue: '',
		years: [],
		params: {
			page: 1,
			pageSize: 10,
			loginName: '',
			userName: '',
			atdUserType: '',
			year: String(new Date().getFullYear())
	
		},
		total: 0
	};

	//获取排班计划列表
	getList = () => {
		let params = JSON.parse(JSON.stringify(this.state.params));
		params.year = Number(params.year);
		params.belongId = Number(this.state.selectValue); 
		this.setState({
			loading: true
		});
		$post('/paiban/api/atd/attendance/v1/statistics/by_user_and_date_type', params).done(res => {
			if(res.status == 200){
				this.setState({
					total: res.body.total,
					list: res.body ? res.body.records.map(item => {
						return {
							userName: item.userName,
							position: item.atdUserType === 100 ? '领导' : '干部',
							workingAtdDays: Number(item.workingAtdDays),
							weekendAtdDays: Number(item.weekendAtdDays),
							vacationAtdDays: Number(item.vacationAtdDays)
						}
					}) : []
				})
			}
		}).always(e => this.setState({
			loading: false
		}));
	}
	

	cols = data => {
		let _this = this;
		return [{
			key: "1",
			dataIndex: 'userName',
			title: "姓名"
		},{
			key: "2",
			dataIndex: 'position',
			title: "职位"
		},{
			key: "3",
			dataIndex: 'workingAtdDays',
			title: "工作日值班天数(天)"
		},{
			key: "4",
			dataIndex: 'weekendAtdDays',
			title: "周末值班天数(天)",
		},{
			key: "5",
			dataIndex: 'vacationAtdDays',
			title: "节假日值班天数(天)"
		}]
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

	//输入框搜索
	nameChange = e => {
		let params = Object.assign({}, this.state.params, { userName: e.target.value })
		this.setState({params})
	}

	//选择职位
	handleChange = (value) => {
		let params = Object.assign({}, this.state.params, { atdUserType: value })
		this.setState({ params });
	}
	//选择计划归属
	handleSChange = (value) => {
		this.setState({
            selectValue: value
		});
		// setCookie('belongId', value);
	}

	//年份改变
	yearChange = (value) => {
		let params = Object.assign({}, this.state.params, { year: value })
		this.setState({ params });
	}

	// 生成前后20年
	// createYears = (num = 20) => {
	// 	let myDate= new Date(); 
	// 	let startYear=myDate.getFullYear()- num;//起始年份 
	// 	let endYear=myDate.getFullYear()+ num;//结束年份 
	// 	let years = [];
	// 	for (var i=startYear;i<=endYear;i++) { 
	// 		years.push(String(i))
	// 	} 
	// 	return years
	// }

	// 获取有排班的年份
	getYears = () => {
		return $post('/paiban/api/atd/attendance/v1/attendanceYears').done(res => {
			if(res.status == 200){
				let params = JSON.parse(JSON.stringify(this.state.params));
				res.body.years.length > 0 && (params.year = String(res.body.years[0]));
				this.setState({
					years: res.body.years.map(year => String(year)),
					params
				})
			}
		})
	}

	// 获取计划归属
	getBelongIds = () => {
		return $get('/paiban/api/atd/attendance-plan-belong/v1/search').done(res => {
			if(res.status == 200){
				let ops = res.body.map(item => {
					return {
						id: String(item.id),
						name: item.name
					}
				})
				ops.unshift({id: '', name: '全部'})
				let belongId = getCookie('belongId') ? getCookie('belongId') : ops[0] ? ops[0].id : '';
				this.setState({
					options: ops,
					selectValue: belongId
				})
			}
		})
	}

	async componentDidMount(){
		await this.getBelongIds();
		await this.getYears();
		this.getList();
		console.log(this)
	}
	render() {
		const { list, loading, selectValue, options } = this.state;
		return <Spin spinning={ loading}>
			<div className="dutyschedule-container">
				<Form inline onSubmit={this.search}>
					<FormItem label="计划归属">
							<Select value={ selectValue } style={{ width: 200 }} onSelect={this.handleSChange}>
								{options.map((option) => {
									return <Option key={ option.id } value={ option.id }>{ option.name }</Option>
								})}
							</Select>
					</FormItem>
					<FormItem label="职位">
						<Select value={ this.state.params.atdUserType	 } style={{ width: 200 }} onSelect={this.handleChange}>
							<Option key="" value="">全部</Option>
							<Option key="100" value="100">领导</Option>
							<Option key="101" value="101">干部</Option>
						</Select>
					</FormItem>
					<FormItem label="姓名">
						<Input placeholder="员工姓名" onChange={this.nameChange} value={this.state.params.userName} />
					</FormItem>
					<FormItem label="年度">
						<Select value={ this.state.params.year } style={{ width: 200 }} onSelect={this.yearChange}>
							{
								this.state.years.map(year => <Option key={year} value={year}>{year}</Option>)
							}
						</Select>
					</FormItem>
					<Button type="primary" onClick={this.getList} htmlType="submit">查询</Button>
				</Form>
				<Table style={{ marginTop: 20 }} rowKey='planId' bordered dataSource={list} columns={this.cols(list)} 
				pagination={this.pagination(this.state.total,this.state.params)} />
			</div>
			</Spin>;
	};
};

export default Dutyschedule;