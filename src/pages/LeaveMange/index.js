import React, { Component } from "react";
import { $post } from "../../utils/auth";
import "./style.less";
import { Button, Spin, Table, Form, Input, Modal, message, Tree, DatePicker } from "antd";
const FormItem = Form.Item;
const confirm = Modal.confirm;
const TreeNode = Tree.TreeNode;
const RangePicker = DatePicker.RangePicker;


class LeaveMange extends Component {
    state = {
        list: [], 
		loading: false,
		params: {
			page: 1,
			pageSize: 10,
            userName: ''
		},
        total: 0,
        search: '',
        visible: false,
        treeData: [],
        step1: true,
        user: {
            text: '',
            id: ''
        },
        rangDate: [],
        selectKey: []
    }


    // 删除请假
    deleteLeave = (item) => {
        confirm({
			title: '提示',
			content: '您是否确认要删除这项内容',
			onOk:() => {
				$post('/paiban/api/atd/user-vacation/v1/del',{
					userVacationId: item.id
				}).done(res => {
					if(res.status == 200){
						if(this.state.list.length <= 1 && this.state.params.page > 1){
							let params = Object.assign({}, this.state.params, { page: this.state.params.page - 1 })
							this.setState({
								params: params
							})
						}
						message.success('已删除');
						this.getList();
					}else{
						message.error(res.msg);
					}
				})
			}
		});
    }

    cols = data => {
		return [{
			key: "1",
			dataIndex: 'userName',
			title: "姓名"
		},{
			key: "2",
			dataIndex: 'beginDate',
			title: "请假开始日期"
		},{
			key: "3",
			dataIndex: 'endDate',
			title: "请假结束日期"
		},{
			key: "4",
			title: "操作",
			render: (text, record) => <a onClick={ this.deleteLeave.bind(this,record) }>删除</a>
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
    }
    
    getList = () => {
        let params = JSON.parse(JSON.stringify(this.state.params));
        this.setState({
			loading: true
        });
        $post('/paiban/api/atd/user-vacation/v1/search',params).done(res => {
			if(res.status == 200){
                let data = res.body ? res.body.records : [];
				this.setState({
					total: res.body.total,
					list: data
				})
			}
		}).always(e => this.setState({
			loading: false
		}));
    }

    //输入框搜索
	nameChange = e => {
		let params = Object.assign({}, this.state.params, { userName: e.target.value })
		this.setState({params})
    }
    
    // 获取人员数据
    getUerData(){
        $post('/paiban/api/user/v1/tree').done(res => {
			if(res.status == 200){
				this.setState({
					treeData: res.body
				})
			}
		})
    }

    searchChange = (e) => {
		this.setState({search: e.target.value})
    }
    
    treeSelect = (info) => {
        let node = this.findTarget(info[0],this.state.treeData);
        this.setState({user: node, selectKey: info});
    }
    
    // 查找树
    findTarget(targetName, source) {
		let resut = undefined;
        for (let item of source) {
			if (item.id === targetName) {
				resut = item
				if(resut) return resut
			}else if(item.children && item.children.length) {
				resut = this.findTarget(targetName, item.children)
				if(resut) return resut
			}
		}
	}
    
    closeChange = () => {
		this.setState({
		    visible: false,
		    search: '',
		    step1: true,
		    user: {
		        text: '',
		        id: ''
		    },
		    rangDate: [],
		    selectKey: []
		})
    }
    
    doAdd = () => {
        if(this.state.rangDate.length == 0){
			message.error('请选择请假日期');
			return
        }
        
        $post('/paiban/api/atd/user-vacation/v1/add',{
			userName: this.state.user.text ,
			userId: Number(this.state.user.code),
			beginDate: this.state.rangDate[0], 
			endDate: this.state.rangDate[1]
		}).done(res => {
			if(res.status == 200){
				message.success('添加成功！');
				this.closeChange();
				this.getList();
			}else{
				message.error(res.msg);
			}
		})
    }

    rangDateChange = (date,dateString) => {
        this.setState({
            rangDate: dateString
        })
    }

    goNext = () => {
        this.setState({step1: false})
    }

    goBack = () => {
        this.setState({step1: true})
    }

    showModal = () => {
        this.setState({visible: true})
    }

    componentDidMount(){
        this.getUerData();
        this.getList();
    }


    render() {
        const { list, loading, treeData } = this.state;

        const drawTreeNodes = (list,target = "") => {
			if(list && list.length){
				if(list.length > 0){
					return list.filter(item => {
						return item.id.includes('dept_') || item.text.includes(target)
					}).map(item => {
						return <TreeNode title={item.text} key={item.id}>
								{drawTreeNodes(item.children,target)}
							</TreeNode>
					})
				}else{
					return ''
				}
			}
        }

        const footers = () => {
            if(this.state.step1){
                if(this.state.user.id == ''){
                    return [<Button key="close" type="ghost" size="large" onClick={this.closeChange}>取消</Button>]
                }else{
                    return [<Button key="close" type="ghost" size="large" onClick={this.closeChange}>取消</Button>,
                    <Button key="back" type="primary" size="large" onClick={this.goNext}>选择日期</Button>]
                }
            }else{
                return [
                    <Button key="close" type="ghost" size="large" onClick={this.closeChange}>取消</Button>,
                    <Button key="back" type="primary" size="large" onClick={this.goBack}>选择人员</Button>,
                    <Button key="submit" type="primary" size="large" onClick={this.doAdd}> 提 交 </Button>]
            }
        }
        
        const formItemLayout = {
			labelCol: { span: 6 },
			wrapperCol: { span: 14 },
		  };

        return <Spin spinning={ loading}>
        <div className="leavemange-container">
            <Button type="primary" className="add-btn" onClick={this.showModal}>添加</Button>
            <Form inline onSubmit={this.search}>
                <FormItem label="姓名">
                    <Input placeholder="员工姓名" onChange={this.nameChange} value={this.state.params.userName} />
                </FormItem>
                <Button type="primary" onClick={this.getList} htmlType="submit">查询</Button>
            </Form>
            <Table style={{ marginTop: 20 }} rowKey='planId' bordered dataSource={list} columns={this.cols(list)} 
            pagination={this.pagination(this.state.total,this.state.params)} />


            <Modal title="添加员工休假" visible={this.state.visible}  closable={false}
            footer={footers()}>
					{
						this.state.step1 ? 
						<div>
							<Input value={this.state.search} onChange={this.searchChange} placeholder="请输入搜索内容" />
						<div className="tree-warp">
						<Tree className="myCls" showLine onSelect={this.treeSelect} defaultExpandAll defaultSelectedKeys={this.state.selectKey}>
							{drawTreeNodes(treeData,this.state.search)}
						</Tree>
					</div>
						</div> : <Form horizontal>
						<FormItem {...formItemLayout} label="员工姓名" >
                            { this.state.user.text }
        				</FormItem>
						<FormItem {...formItemLayout} label="请假时间" >
                            <RangePicker value={this.state.rangDate} onChange={this.rangDateChange} />
        				</FormItem>
					</Form>
					}
					
				</Modal>
        </div>
        </Spin>
    }
}

export default LeaveMange