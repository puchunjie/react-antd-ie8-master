import React, { Component } from "react";
import df from 'dateformat-util'
import "./style.less";
import { Button, Icon, Spin, Calendar, Select, Tag, Alert, message, Modal, Tree, DatePicker, Form, Radio } from "antd";
import { $get, $post, setCookie, getCookie } from "../../utils/auth";
import { getNextFirstDay } from "../../utils/fns";
const Option = Select.Option;
const TreeNode = Tree.TreeNode;
const ButtonGroup = Button.Group;
const FormItem = Form.Item;
const RadioGroup = Radio.Group;

class Dutycalendar extends Component {
	state = {
		list: [], //日历数据
		loading: false,
		options: [],
		selectValue: '',
		year: new Date().getFullYear(),
		month: new Date().getMonth() + 1,
		dateDone: false,
		dateValue: new Date(),
		visible: false,//调换人员
		treeData: [],
		originUserType: '',
		originUserId: '',
		originAtdDate: '',
		atdUserId: '',
		atdDate: new Date(),
		search: '',
		targetUsers: []
	};

	//获取日历数据
	getList = (belongId) => {
		this.setState({
			loading: true
		});
		$get('/paiban/api/atd/attendance/v1/list/month', {
			belongId: belongId || this.state.selectValue,
			year: this.state.year,
			month: this.state.month
		}).done(res => {
			if(res.status == 200){
				this.state.list = res.body.map(item => {
					let data = item;
					data.atdUsers = item.atdUsers.map(el => {
						return {
							...el,
							atdDate: item.atdDate
						}
					})
					return data
				})
			}
		}).always(e => this.setState({
			loading: false,
			dateDone: true
		}));
	}
	// 画出每天的人员
	dateCellRender = (value) => {
		let year = value.getYear();
		let month = value.getMonth() + 1;
		month = month < 10 ? '0' + month : month;
		let day = value.getDayOfMonth();
		day = day < 10 ? '0' + day : day;
		let _thisDay = year + '-' + month + '-' + day;
		if(this.state.list.some(item => {
			return item.atdDate == _thisDay
		})){
			let data = this.state.list.find(item => item.atdDate == _thisDay);
			let leaders = data.atdUsers.filter(item => item.userType == 100).map(item => {
				return <Tag color="blue" key={item.userId} onClick={ this.tagClick.bind(this,item) }>{ item.userName }</Tag>
			});
			let inproee = data.atdUsers.filter(item => item.userType == 101).map(item => {
				return <Tag color="green" key={item.userId}  onClick={ this.tagClick.bind(this,item) }>{ item.userName }</Tag>
			});
			if(data.atdDateType == -1){
				return <Alert
				message="未排班"
				description="暂未排班"
				type="warning"
				showIcon
			  />
			}else{
				return <div>{ leaders }{ inproee }</div>
			}
		}
		
	}
	//点击换人
	tagClick = (item) => {
		let nextDay = new Date(new Date(item.atdDate).getTime() + (1000*60*60*24));
		this.setState({
			originUserType: item.userType,
			originUserId: item.userId,
			originAtdDate: item.atdDate,
			atdDate: nextDay,
			visible: true
		})
		setTimeout(() => {
			this.findUser(nextDay);
		},0)
	}

	//选择日期，找出当日可调换的人
	findUser = (date) => {
		let targetData = this.state.list.find(item => item.atdDate == df.format(date,'yyyy-MM-dd'));
		targetData = targetData ? targetData.atdUsers : [];
		let targetUsers = targetData.filter(item => item.userType == this.state.originUserType).map(item => {
			return {
				actived: false,
				...item
			}
		});
		this.setState({
			targetUsers
		})
	}

	// 选中要兑换的人
	targetClick = (i) => {
		let targetUsers = JSON.parse(JSON.stringify(this.state.targetUsers));
		for(let item of targetUsers){
			item.actived = false
		}
		targetUsers[i].actived = true;
		this.setState({
			targetUsers,
			atdUserId: targetUsers[i].userId
		})
	}
	doExchange = () => {
		if(this.state.atdUserId == this.state.originUserId){
			message.error('请选择有效的人员！');
			return
		}

		if(this.state.atdDate == ''){
			message.error('请选择日期！');
			return
		}

		if(this.state.atdUserId == ''){
			message.error('请选择对掉人员！');
			return
		}

		
		$post('/paiban/api/atd/attendance/v1/user/swap',{
			atdDate: this.state.atdDate ,
			atdUserId: this.state.atdUserId ,
			originUserId: this.state.originUserId, 
			originAtdDate: this.state.originAtdDate
		}).done(res => {
			if(res.status == 200){
				message.success('调换成功！');
				this.setState({
					originUserId: '',
					originAtdDate: '',
					originUserType: '',
					atdDate: new Date(),
					atdUserId: '',
					targetUsers: [],
					visible: false
				})
				this.getList();
			}else{
				message.error(res.msg);
			}
		})
	}

	closeChange = () => {
		this.setState({
			originUserId: '',
			originAtdDate: '',
			originUserType: '',
			atdDate: new Date(),
			atdUserId: '',
			targetUsers: [],
			visible: false,
			search: ''
		})
	}

	// treeSelect = (info) => {
	// 	let node = this.findTarget(info[0],this.state.treeData);
	// 	if(info[0].includes('user_')){
	// 		this.state.atdUserId = Number(node.code)
	// 	}else{
	// 		this.state.atdUserId = ''
	// 	}
	// }

	// 查找树
    // findTarget(targetName, source) {
	// 	let resut = undefined;
    //     for (let item of source) {
	// 		if (item.id === targetName) {
	// 			resut = item
	// 			if(resut) return resut
	// 		}else if(item.children && item.children.length) {
	// 			resut = this.findTarget(targetName, item.children)
	// 			if(resut) return resut
	// 		}
	// 	}
	// }
	

	// 日历切换
	onPanelChange = (date, mode) => {
		let year = date.getYear();
		let month = date.getMonth() + 1;
		this.state.year = year;
		this.state.month = month;
		this.setState({
			dateValue: new Date(date.time)
		})
		this.getList();
	}
	//选择计划归属
	handleChange = (value) => {
		this.setState({
            selectValue: value
		});
		setCookie('belongId', value);
		this.getList(value);
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
					options: ops,
					selectValue: ops[0] ? ops[0].id : ''
				})
				
				let belongId = getCookie('belongId') ? getCookie('belongId') : ops[0] ? ops[0].id : '';
				this.setState({ selectValue: belongId })
				this.getList(belongId);
			}
		})
	}
	
	// 获取人员数据
    // getUerData(){
    //     $post('/paiban/api/user/v1/tree').done(res => {
	// 		if(res.status == 200){
	// 			this.setState({
	// 				treeData: res.body
	// 			})
	// 		}
	// 	})
	// }
	
	// searchChange = (e) => {
	// 	this.setState({search: e.target.value})
	// }

	componentDidMount(){
		this.getBelongIds();
		// this.getUerData();
	}

	prev = () => {
		let year = this.state.year;
		let month = this.state.month;
		month = month > 1 ? month - 1 : 12;
		year = month == 12 ? year - 1 : year;
		this.state.year = year;
		this.state.month = month;
		month = month > 9 ? month : `0${month}`;
		let date = `${year}-${month}-01`;
		this.setState({
			dateValue: new Date(date)
		})
		this.getList();
	}

	next = () => {
		let year = this.state.year;
		let month = this.state.month;
		month = month >= 12 ? 1 : month + 1;
		year = month == 1 ? year + 1 : year;
		this.state.year = year;
		this.state.month = month;
		month = month > 9 ? month : `0${month}`;
		let date = `${year}-${month}-01`;
		this.setState({
			dateValue: new Date(date)
		})
		this.getList();
	}

	render() {
		const { dateValue, loading, options, selectValue, treeData,atdDate } = this.state;
		let calender = null;
		if(this.state.dateDone){
			calender = <Calendar ref="calender" className="server-calendar"
			value={dateValue} 
			onPanelChange={ this.onPanelChange} dateCellRender={this.dateCellRender} />
		}

		// const drawTreeNodes = (list,target = "") => {
		// 	if(list && list.length){
		// 		if(list.length > 0){
		// 			return list.filter(item => {
		// 				return item.id.includes('dept_') || item.text.includes(target)
		// 			}).map(item => {
		// 				return <TreeNode title={item.text} key={item.id}>
		// 						{drawTreeNodes(item.children,target)}
		// 					</TreeNode>
		// 			})
		// 		}else{
		// 			return ''
		// 		}
		// 	}
		// }

		const disabledDate = (current) => {
			let year = dateValue.getFullYear();
			let month = dateValue.getMonth() + 1;
			let maxDate = getNextFirstDay(year,month);
			let minDate = new Date(this.state.originAtdDate);
			
			return current.getTime() <= minDate || current.getTime() > maxDate
		}

		const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		  };

		return <Spin spinning={ loading}>
			<div className="dutycalendar-container">
				<div className="belong-select">
					计划归属 ： <Select value={ selectValue } style={{ width: 200 }} onSelect={this.handleChange}>
						{options.map((option) => {
							return <Option key={ option.id } value={ option.id }>{ option.name }</Option>
						})}
						</Select>

						<ButtonGroup style={{ marginLeft:300 }}>
							<Button type="primary" onClick={this.prev}><Icon type="left" />上个月</Button>
							<Button type="primary" onClick={this.next}>下个月<Icon type="right" /></Button>
						</ButtonGroup>
				</div>
				{ calender }

				<Modal title="人员调换" visible={this.state.visible} onOk={this.doExchange} onCancel={this.closeChange}>
					{/* {
						this.state.visible ? 
						<div>
							<Input value={this.state.search} onChange={this.searchChange} placeholder="请输入搜索内容" />
						<div className="tree-warp">
						<Tree className="myCls" showLine onSelect={this.treeSelect} defaultExpandAll>
							{drawTreeNodes(treeData,this.state.search)}
						</Tree>
					</div>
						</div> : ''
					} */}
					<Form horizontal>
						<FormItem {...formItemLayout} label="调换日期" >
							<DatePicker value={atdDate} disabledDate={disabledDate} onChange={this.findUser}/>
        				</FormItem>
						<FormItem {...formItemLayout} label="调换人员" >
							<div>
								{
									this.state.targetUsers.map((item,i) => <Tag color={item.actived ? 'blue' : ''} key={item.userId} 
									onClick={ this.targetClick.bind(this,i) }>{ item.userName }</Tag>)
								}
							</div>
        				</FormItem>
					</Form>
				</Modal>
			</div>
			</Spin>;
	};
};
export default Dutycalendar;