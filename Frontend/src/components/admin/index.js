import React from 'react';
// import { useState, useEffect } from 'react';
import * as Icon from 'react-feather';
import axios from 'axios';
import Table from './table';
// import $ from 'jquery';
import { ENDPOINT } from '../../config';

axios.defaults.withCredentials = true;

class Doctor extends React.Component {
	state = {
		loading: true,
		loggedin: false,
		username: '',
		password: ''
	};

	componentDidMount() {
		console.log("component did mount. logging in")
		this.login();
	}

	logout = (e) => {
		if (e && e.preventDefault) e.preventDefault();

		this.setState({ loading: true, error: '' });
		axios
			.get(ENDPOINT + '/admin/logout')
			.then((response) => {
				const { loggedOut } = response.data;
				if (loggedOut) {
					this.setState({
						loggedin: false,
						username: '',
						password: ''
					});
				} else {
					this.setState({ error: 'Error Occured!' });
				}
				this.setState({ loading: false });
			})
			.catch((err) => {
				this.setState({ loading: false, error: 'Internal Server Error!' });
				console.log(err);
			});
	};

	login = (e) => {
		if (e && e.preventDefault) e.preventDefault();

		// noinspection JSUnusedLocalSymbols
		const { loading, username, password } = this.state;

		this.setState({ loading: true, error: '' });
		axios
			.post(ENDPOINT + '/admin/login', {
				username,
				password
			})
			.then((response) => {
				const { login, username } = response.data;
				if (login) {
					this.setState({
						loggedin: true
					});
				} else {
					if (username || password) this.setState({ error: 'Invalid Credentials!' });
				}
				this.setState({ loading: false });
			})
			.catch((err) => {
				if (username || password)
					this.setState({ loading: false, error: 'Internal Server Error!' });
				console.log(err);
			});
	};

	handleChange = (event) => {
		const { id, value } = event.target;
		this.setState({
			[id]: value
		});
	};

	render() {
		console.log("rendering admin")
		const { loggedin, username, password, error, loading } = this.state;

		if (!loggedin) {
			return (
				<div className="Home">
					{loading ? (
						<div class="lds-dual-ring"></div>
					) : (
						<form onSubmit={this.login} className="login-form fadeInUp">
							<p>{error}</p>
							<h3>Username: </h3>
							<input
								id="username"
								value={username}
								onChange={this.handleChange}
								type="username"
								autoComplete="off"
								autoCorrect="off"
								spellCheck="false"
							/>
							<h3>Password: </h3>
							<input
								id="password"
								value={password}
								onChange={this.handleChange}
								type="password"
								autoComplete="off"
								autoCorrect="off"
								spellCheck="false"
							/>
							<button type="submit" className="send">
								<Icon.Send />
							</button>
						</form>
					)}
				</div>
			);
		}

		return (
			<div className="Home">
				<div>
					<form onSubmit={this.logout} className="login-form fadeInUp">
						<p>{error}</p>
						<button
							onClick={this.logout}
							className="logout fadeInUp"
							style={{ animationDelay: '0.8s' }}
						>
							Logout
						</button>
					</form>
					<Table />
				</div>
			</div>
		);
	}
}

export default Doctor;
