import React, { useState } from 'react';
import './adminAddNews.css';
import { Form, Input, Button, DatePicker, Select, InputNumber, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import axios from 'axios';
import AWS from 'aws-sdk';

const { TextArea } = Input;
const { Option } = Select;

AWS.config.update({
  accessKeyId: 'AKIAQE3RPBDKD6L2JC6P',
  secretAccessKey: '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',
  region: 'ap-south-1'
});

const s3 = new AWS.S3();

const AdminAddNewManagement = () => {
  const [trailerList, setTrailerList] = useState([]);

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('title', values.title);
    formData.append('date', values.date.format('YYYY-MM-DD'));
    formData.append('duration', values.duration);
    formData.append('category', values.category);
    formData.append('description', values.description);
    formData.append('price', values.price);

    if (trailerList.length > 0) {
      const trailerFile = trailerList[0].originFileObj;
      const params = {
        Bucket: 'showzmovies',
        Key: `trailers/${trailerFile.name}`,
        Body: trailerFile,
        ContentType: trailerFile.type
      };

      try {
        // Upload the trailer to AWS S3
        const uploadResponse = await s3.upload(params).promise();

        // Add the trailer URL to the form data
        formData.append('trailer', uploadResponse.Location);

        // Add the news with the trailer URL
        await axios.post('http://localhost:8000/api/news', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        message.success('News added successfully!');
        setTrailerList([]);
      } catch (error) {
        console.error('Error uploading trailer:', error.message);
        message.error('Failed to upload trailer. Please try again.');
      }
    } else {
      message.error('Please upload a trailer.');
    }
  };

  const handleFileChange = ({ fileList }) => {
    const isVideo = fileList.every(file => file.type.startsWith('video/'));
    if (isVideo) {
      setTrailerList(fileList);
    } else {
      message.error('Please upload only video files.');
    }
  };

  return (
    <section className='admin-upcoming-movies'>
      <h2>Add News</h2>
      <Form
        name="add-news"
        layout="vertical"
        onFinish={onFinish}
      >
        <Form.Item
          name="title"
          rules={[{ required: true, message: 'Please input the news title!' }]}
        >
          <Input placeholder='News Title' />
        </Form.Item>
        <Form.Item
          name="trailer"
          rules={[{ required: true, message: 'Please upload the trailer!' }]}
        >
          <Upload
            name="trailer"
            listType="picture"
            beforeUpload={() => false}
            onChange={handleFileChange}
          >
            <Button icon={<UploadOutlined />}>Upload Trailer</Button>
          </Upload>
        </Form.Item>
        <Form.Item
          name="date"
          rules={[{ required: true, message: 'Please select the release date!' }]}
        >
          <DatePicker placeholder='Select Release Date' />
        </Form.Item>
        <Form.Item
          name="duration"
          rules={[{ required: true, message: 'Please input the news duration!' }]}
        >
          <Input placeholder='Duration (e.g., 2h 30m)' />
        </Form.Item>
        <Form.Item
          name="category"
          rules={[{ required: true, message: 'Please select the news category!' }]}
        >
          <Select placeholder='Select Category'>
            <Option value="Action">Action</Option>
            <Option value="Drama">Drama</Option>
            <Option value="Comedy">Comedy</Option>
            <Option value="Thriller">Thriller</Option>
          </Select>
        </Form.Item>
        <Form.Item
          name="description"
          rules={[{ required: true, message: 'Please input the news description!' }]}
        >
          <TextArea placeholder='Description' rows={4} />
        </Form.Item>
        <Form.Item
          name="price"
          rules={[{ required: true, message: 'Please input the ticket price!' }]}
        >
          <InputNumber min={0} placeholder='Ticket Price' />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit">
            Add News
          </Button>
        </Form.Item>
      </Form>
    </section>
  );
};

export default AdminAddNewManagement;
