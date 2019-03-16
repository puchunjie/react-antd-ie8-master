import React, { Component } from "react";
import df from 'dateformat-util'
import "./style.less";
import { Button, Icon, Spin, Calendar, Select, Tag, Alert, message, Modal, Tree, DatePicker, Form, Radio, Input } from "antd";
import { $get, $post, setCookie, getCookie, apiDomain } from "../../utils/auth";
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
		jihuaoptions: [],
		selectValue: '',
		jihuaValue: '',
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
		targetUsers: [],
		btLoading: false,
		isSwap: true, //是否是对调
		depOps: [], //部门列表
		selectDepId: 'hahhah',
		nameSearch: ''
	};

	//获取日历数据
	getList = (belongId) => {
		this.setState({
			loading: true
		});
		$get('/paiban/api/atd/attendance/v1/list/month', {
			belongId: belongId || this.state.selectValue,
			year: this.state.year,
			month: this.state.month,
			planId: this.state.jihuaValue
		}).done(res => {
			if(res.status == 200){
				this.state.list = res.body.map(item => {
					let data = item;
					data.atdUsers = item.atdUsers.map(el => {
						return {
							...el,
							atdDate: item.atdDate,
							highLight: false
						}
					})
					return data
				})
			}else{
				this.state.list = [];
			}
		}).error(err => {
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
				return <Tag color="blue" className={ !item.highLight && 'opcity' } key={item.userId} onClick={ this.tagClick.bind(this,item) }>{ item.userName }</Tag>
			});
			let inproee = data.atdUsers.filter(item => item.userType == 101).map(item => {
				return <Tag color="green" className={ !item.highLight && 'opcity' } key={item.userId}  onClick={ this.tagClick.bind(this,item) }>{ item.userName }</Tag>
			});
			let voication = <p className="v-span">{data.dateRemark && data.dateRemark == '未排班' ? '' : data.dateRemark}</p>;
			if(data.atdDateType == -1){
				return <div className="c-item">{voication}<Alert
				message="未排班"
				description="暂未排班"
				type="warning"
				showIcon
			  /></div>
			}else{
				return <div className="c-item">{voication}{ leaders }{ inproee }</div>
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
			targetUsers,
			atdDate: date
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
		if(this.state.isSwap){
			if(this.state.atdUserId == this.state.originUserId){
				message.error('请选择有效的人员！');
				return
			}
	
			if(this.state.atdUserId == ''){
				message.error('请选择对掉人员！');
				return
			}
		}

		if(this.state.atdDate == ''){
			message.error('请选择日期！');
			return
		}

		
		if(this.state.isSwap){
			$post('/paiban/api/atd/attendance/v1/user/swap',{
				atdDate: df.format(this.state.atdDate,'yyyy-MM-dd') ,
				atdUserId: this.state.atdUserId ,
				originUserId: this.state.originUserId, 
				originAtdDate: this.state.originAtdDate
			}).done(res => {
				if(res.status == 200){
					message.success('对调成功！');
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
		}else{
			$post('/paiban/api/atd/attendance/v1/date/change',{
				atdDate: df.format(this.state.atdDate,'yyyy-MM-dd') ,
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
	
	// 日历切换
	onPanelChange = (date, mode) => {
		let year = date.getYear();
		let month = date.getMonth() + 1;
		this.state.year = year;
		this.state.month = month;
		this.setState({
			dateValue: new Date(date.time)
		})
		this.setEmpty();
		this.getPlanes().then(() => {
			this.getList()
		});
	}
	//选择计划归属
	 handleChange = (value) => {
		this.setState({
        selectValue: value
		});
		setCookie('belongId', value);
		this.setEmpty();
		this.getPlanes(value).then(() => {
			this.getList()
		});
	}

	jiaChange = (value) => {
		this.setState({
    	jihuaValue: value
		});
		this.state.jihuaValue = value;
		this.setEmpty();
		this.getList();
	}

	depChange = value => {
		this.setState({
    	selectDepId: value
		});
		this.state.selectDepId = value;
		this.setHight(null,value);
	}

	searchChange = e => {
		this.setState({
			nameSearch: e.target.value
		})
		this.state.nameSearch = e.target.value;
		this.setHight(e.target.value)
	}

	setHight = (search,depId) => {
		depId = depId === undefined ? this.state.selectDepId : depId;
		search = search === null ? this.state.nameSearch : search;
		let list = JSON.parse(JSON.stringify(this.state.list));
		// 是否需要考虑部门
		let withDep = depId !== 'hahhah';
		list.forEach(item => {
			item.atdUsers.forEach(user => {
				let textH = user.userName.includes(search);
				user.highLight =  search === '' ? user.deptId == depId : withDep ? textH && user.deptId == depId : textH;
			})
		})
		this.setState({list})
	}

	setEmpty = () => {
		this.setState({
			selectDepId: 'hahhah',
			nameSearch: ''
		});
		this.selectDepId = 'hahhah';
		this.nameSearch = '';
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
				this.setState({
					options: ops
				})
				
				let belongId = getCookie('belongId') ? getCookie('belongId') : ops[0] ? ops[0].id : '';
				this.setState({ selectValue: belongId })
			}
		})
	}

	getPlanes = (bid) => {
		return $post('/paiban/api/atd/attendance-plan/v1/list/by_belong_month',{
			belongId: bid || this.state.selectValue,
			year: this.state.year,
			month: this.state.month
		}).done(res => {
			if(res.status == 200){
				let ops = res.body.map(item => {
					return {
						id: String(item.planId),
						name: item.name
					}
				})
				this.setState({
					jihuaoptions: ops
				})
				
				let jihuaId = ops[0] ? ops[0].id : '';
				this.setState({ jihuaValue: jihuaId })
			}
		})
	}

	getDeps = (bid) =>{
		return $get('/paiban/api/atd/attendance/v1/depts',{
			belongId: bid || this.state.selectValue,
			planId: this.state.jihuaValue,
			year: this.state.year,
			month: this.state.month
		}).done(res => {
			if(res.status == 200){
				let depOps = res.body.map(dep => {
					dep.deptId = String(dep.deptId)
					return dep
				}) || [];
				depOps.unshift({deptId: 'hahhah',name: "全部"})
				this.setState({depOps})
			}
		})
	}


	// 导出
	doExport = () => {
		let params = `belongId=${this.state.selectValue}&year=${this.state.year}&month=${this.state.month}&planId=${this.state.jihuaValue}`;	
		let url = apiDomain + `/paiban/api/atd/attendance/v1/list/month/export?${params}`;
		window.open(url,'_blank');
	}

	exportFile = (blob, fileName = '') => {
		let b = '';
		if (window.navigator.msSaveOrOpenBlob){
			navigator.msSaveBlob(blob, fileName);
		} else {
			b = new Blob([blob], {
				type: 'application/vnd.ms-excel'
			});
		}
		let a = document.createElement('a');
		let url = window.URL.createObjectURL(b);
		a.href = url;
		a.download = fileName;
		let evt = document.createEvent('MouseEvents'); // 创建window的事件
		evt.initEvent('click', false, false); //  事件是click事件
		a.dispatchEvent(evt);
		window.URL.revokeObjectURL(url);
	}

	async componentDidMount(){
		await this.getBelongIds();
		await this.getPlanes();
		await this.getDeps();
		this.getList();
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
		this.setEmpty();
		this.getPlanes().then(() => {
			this.getList()
		});
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
		this.setEmpty();
		this.getPlanes().then(() => {
			this.getList()
		});
	}

	swapChange = (e) => {
    this.setState({
      isSwap: e.target.value,
    });
  }

	render() {
		const { dateValue, loading, options, selectValue, treeData,atdDate, jihuaValue,jihuaoptions,selectDepId, depOps, nameSearch } = this.state;
		let calender = null;
		if(this.state.dateDone){
			calender = <Calendar className={ nameSearch === '' && selectDepId === 'hahhah'  ? 'no-opcity server-calendar' : 'server-calendar' } ref="calender"
			value={dateValue} 
			onPanelChange={ this.onPanelChange} dateCellRender={this.dateCellRender} />
		}

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
					计划归属 ： <Select value={ selectValue } style={{ width: 180,marginRight: 10 }} onSelect={this.handleChange}>
						{options.map((option) => {
							return <Option key={ option.id } value={ option.id }>{ option.name }</Option>
						})}
						</Select>

						值班计划：<Select value={ jihuaValue } style={{ width: 150,marginRight: 10 }} onSelect={this.jiaChange}>
						{jihuaoptions.map((option) => {
							return <Option key={ option.id } value={ option.id }>{ option.name }</Option>
						})}
						</Select>

						部门：<Select value={ selectDepId } style={{ width: 150,marginRight: 10 }} onSelect={this.depChange}>
						{depOps.map((option) => {
							return <Option key={ option.deptId } value={ option.deptId }>{ option.name }</Option>
						})}
						</Select>

						名称：<Input style={{ width: 150 }} value={this.state.nameSearch} onChange={this.searchChange} placeholder="请输入人名" />
						<ButtonGroup className="next-prev">
							<Button type="primary" onClick={this.prev}><Icon type="left" />上个月</Button>
							<Button type="primary" onClick={this.next}>下个月<Icon type="right" /></Button>
						</ButtonGroup>
						<Button className="export-btn" loading={this.state.btLoading} type="primary" onClick={this.doExport}>导出</Button>
				</div>
				
				{ calender }

				<Modal title="人员调换" visible={this.state.visible} onOk={this.doExchange} onCancel={this.closeChange}>
					<Form horizontal>
						<FormItem {...formItemLayout} label="调换日期" >
							<DatePicker value={atdDate} disabledDate={disabledDate} onChange={this.findUser}/>
        		</FormItem>
						<FormItem {...formItemLayout} label="调换类型" >
						<RadioGroup onChange={this.swapChange} value={this.state.isSwap}>
							<Radio key="1" value={true}>对调</Radio>
							<Radio key="2" value={false}>调换</Radio>
						</RadioGroup>
        		</FormItem>
						{
							this.state.isSwap ? <FormItem {...formItemLayout} label="调换人员" >
							<div>
								{
									this.state.targetUsers.map((item,i) => <Tag color={item.actived ? 'blue' : ''} key={item.userId} 
									onClick={ this.targetClick.bind(this,i) }>{ item.userName }</Tag>)
								}
							</div>
        		</FormItem> : ''
						}
						
					</Form>
				</Modal>
			</div>
			</Spin>;
	};
};
export default Dutycalendar;