import React, { Component } from "react";
import { Tree } from 'antd';
const TreeNode = Tree.TreeNode;


class UserPicker extends Component{
    state = {
        value: [],
        treeData: []
    }

    // 获取人员数据
    getUerData(){
        $post('/paiban/api/user/v1/tree').done(res => {
			if(res.status == 200){
                const modfiyTree = (list) => {
                    let arr = list || [];
                    arr = JSON.parse(JSON.stringify(arr));
                    return arr.map(item => {
                        let data = Object.assign({},item);
                        data.value = data.id;
                        data.label = data.text;
                        data.key = data.id;
                        data.children = modfiyTree(data.children);
                        return data
                    })
                }
				this.setState({
					treeData: modfiyTree(res.body)
				})
			}
		})
    }

    componentDidMount(){
        this.getUerData()
    }

    render() {
        
        return 
            <Tree className="myCls" showLine checkable >
                <TreeNode title="parent 1" key="0-0">
                    
                </TreeNode>
            </Tree>
    }
}


export default UserPicker