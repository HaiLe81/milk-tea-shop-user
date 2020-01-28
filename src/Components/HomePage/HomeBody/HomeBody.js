import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import './HomeBody.css';
import 'antd/dist/antd.css';
import { TimeStore } from '../../TimeStore/TimeStore';
import { DataContext } from '../../../context/DataProvider';
import { Card } from 'antd';
import MessengerCustomerChat from 'react-messenger-customer-chat'

const { Meta } = Card;

export const HomeBody = () => {
	let { store: { products } } = useContext(DataContext);
	// console.log('product', products);
	// console.log('cate', productCategories);
	// findcategoryNameById
	// const findCategoryNameById = (id) => {
	// 	let category = productCategories.find((item) => item.id === id);
	// 	if (category !== undefined) return category.name;
	// 	return 'unknown';
	// };
	// const fillterProductIsdeleted = (isDeleted) => {
	// 	let foundisDeleted = products.find((item) => item.isDeleted === false);
	// 	return true;
	// }
	// console.log('zz',products.price);
	return (
		// <Router>
		<div className="home-main">
			<div className="container">
				<div className="section-title">
					<h3>Oal Milk Tea</h3>
					<h2>SẢN PHẨM NỔI BẬT</h2>
					<img alt="err" src="//theme.hstatic.net/1000360860/1000486980/14/home_line.png?v=1359" />
				</div>
				<TimeStore />
				{/* show 12 products */}
				<div className="section-content">
					<div className="grid-container">
						{products.slice(3, 15).map((item) => (
							//fix here
							<Card
								key={item.id}
								className="grid-item"
								hoverable
								style={{ width: 240, height: 395 }}
								cover={<img alt="not found" height="260px" width="260px" src={item.imgURL} />}
							>
								{/* fix CSS text-overflow Property */}
								<Meta title={item.name} description={item.price} />
							</Card>
						))}
						{/* {products.map(item => <div key={item.id} className="grid-item">{item.name} ----{findCategoryNameById(item.item)} </div>)} */}
					</div>
				</div>

				<div className="btn_1">
					<Link className="slide-1" to="/product">
						XEM TẤT CẢ
						</Link>
				</div>
				<div className="home-introduct1">
					<img
						alt="err"
						className="img_int1"
						src="//theme.hstatic.net/1000360860/1000486980/14/banner_about_us.png?v=1359"
					/>
					<div className="aboutus-txt">
						<div className="section-title1">
							<h3>Oal Milk Tea Story</h3>
							<h2>VỀ CHÚNG TÔI</h2>
							<img
								alt="not found"
								src="//theme.hstatic.net/1000360860/1000486980/14/home_line.png?v=1359"
							/>
						</div>
						<p>
							Bên cạnh niềm tự hào về những ly trà sữa ngon – sạch – tươi, chúng tôi luôn tự tin mang
							đến khách hàng những trải nghiệm tốt nhất về dịch vụ và không gian.
							</p>
					</div>
				</div>
				<div />
			</div>
			<div>
				<MessengerCustomerChat
					pageId="106379520893519"
					appId="106379520893519"
				/>
			</div>
		</div>
		// </Router>
	);
};
