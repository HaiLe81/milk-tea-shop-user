import React from 'react';
import './App.css';
import { TopMenu } from '../src/Components/Top-Menu/TopMenu';
import { DataProvider } from './context/DataProvider';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import { News1 } from './Components/News/News1/News1';
import { News2 } from './Components/News/News2/News2';
import { Product } from './Components/Product/Product';
import { Introduct1 } from './Components/Introduct/Introduct1/Introduct1';
import { Introduct2 } from './Components/Introduct/Introduct2/Introduct2';
import { HomePage } from './Components/HomePage/HomePage';
import { Order } from './Components/Order/Order';
import { OrderModal } from './Components/Order/OrderModal/OrderModal';
import { ProductDetail } from './Components/Product/ProductDetail/ProductDetail';
import { Account } from './Components/Account/Account';

const App = () => {
	return (
		<div className="App">
			<Router>
				<DataProvider>
					<TopMenu />
					<Switch>
						<Route path="/account">
							<Account />
						</Route>
						<Route path="/productdetail">
							<ProductDetail />
						</Route>
						<Route path="/ordermodal">
							<OrderModal />
						</Route>
						<Route path="/order">
							<Order />
						</Route>
						<Route path="/news1">
							<News1 />
						</Route>
						<Route path="/news2">
							<News2 />
						</Route>
						<Route path="/product">
							<Product />
						</Route>
						<Route path="/introduct2">
							<Introduct2 />
						</Route>
						<Route path="/introduct1">
							<Introduct1 />
						</Route>
						<Route path="/">
							<HomePage />
						</Route>
					</Switch>
				</DataProvider>
			</Router>
		</div>
	);
};

export default App;
