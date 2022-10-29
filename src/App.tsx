/* eslint-disable react-hooks/rules-of-hooks */
import React, { useEffect, useState } from 'react';
import { Octokit } from 'octokit';
import { Col, Row, Card, Layout, Pagination, List, Avatar, Input } from 'antd';  
import * as Constants from './config/constants'
import './App.css';

const { Header, Footer, Content } = Layout;
const { Search } = Input;

interface DataType {
  key: number | null;
  full_name: string | null;
  description: string | null;
  owner: string | null;
} 

function App() { 
  const [pageNumber, setPageNumber] = useState(1);
  const [total, setTotal] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [query, setQuery] = useState('')
  const [dataSource, setDataSource] = useState<DataType[]>([]); 

  async function fetchData() {
      const octokit = new Octokit({
        auth: Constants.GIT_AUTH_KEY
      })

      await octokit.request('GET /search/repositories', {
        q: query,
        sort: "updated",
        direction: "asc",
        per_page: pageSize,
        page: pageNumber
      }).then((res) => {  
        setTotal(res.data.total_count)
        let itemsArray: DataType[] = [];
        res.data.items.map((item, index) => {
          itemsArray.push(
            {
              key: index,              
              description: item.description,
              full_name: item.full_name,
              owner: item.owner?.avatar_url || "",
            },
          ) 
        })
        setDataSource(itemsArray); 

      }).catch((error) => {
        console.log('error... ');
      })
  }

  const onSearch = (value: string) => { 
    setQuery(value); 
  };

  const onChangeHandler = (page: number, pageSize:number) => { 
    setPageNumber(page)
    setPageSize(pageSize)
  } 

  useEffect(() => {    
    if(query !== '') {
      fetchData();
    }
  }, [pageNumber, pageSize, query]);

  return ( 
    <Layout>
      <Header className='header'>Git repository List</Header>
      <Content>
        <Row>
          <Col span={24}>  
              <Search
                placeholder="input search text"
                allowClear
                enterButton="Search"
                size="large"
                onSearch={onSearch}
                className='search'
              /> 
          </Col>
        </Row>
        <Row>
          <Col span={24}>
            <Card> 
              <List
                itemLayout="horizontal"
                dataSource={dataSource}
                renderItem={item => (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar src={item.owner} />}
                      title={<a href={"https://github.com/" + item.full_name} target='_blank' rel="noreferrer">{item.full_name}</a>} 
                    />
                  </List.Item>
                )}
              />
            </Card>
            <Card>
              <Pagination defaultCurrent={1} total={total} onChange={(page:number, pageSize:number)=>onChangeHandler(page, pageSize)}/>
            </Card>
          </Col>
        </Row> 
      </Content>
      <Footer style={{ textAlign: 'center' }}>copyright ©2022 Created by Lim Chong</Footer>
    </Layout>       
  );
}

export default App;
