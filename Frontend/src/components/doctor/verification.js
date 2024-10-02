import React from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { ClipLoader } from 'react-spinners';

import './doctor.scss';
import { ENDPOINT } from '../../config';
import { shortText } from './helper/utils';
import SelectOptions from './components/ui/selectOptions';
import QuestionBox from './components/questionBox';

class Verification extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			verificationData: [],
			loading: false,
			langType: 'english'
		};
	}

	componentWillMount() {
		this.getAllConversations();
	}

	getAllConversations = async () => {
		this.setState({ loading: true });
		try {
			const res = await axios.get(ENDPOINT + '/api/verification');
			console.log(res.data);
			this.setState({ verificationData: res.data });
		} catch (error) {
			toast.error('Conversation Data Not avaliable !!');
			console.log(error);
		} finally {
			this.setState({ loading: false });
		}
	};

	langToggle = (e) => {
		e.preventDefault();
		const value = e.target.value;
		console.log(value);
		this.setState({ langType: value });
	};

	render() {
		const { verificationData, langType, loading } = this.state;
		return (
			<div className="verification-main">
				<div className="verification-main-top">
					<p>Select Language</p>
					<SelectOptions
						name={'lang'}
						onChange={this.langToggle}
						selectOptions={[
							{ values: 'english', showValues: 'English' },
							{ values: 'hindi', showValues: 'हिंदी' }
						]}
					/>
				</div>
				<div className="question-main">
					{!verificationData.length > 0 ? (
						<div className="question-main-loader">
							<ClipLoader size={300} />
						</div>
					) : (
						verificationData?.map((questionNodes) => (
							<div className="question-main-wrapper" key={questionNodes._id}>
								{questionNodes?.nodes?.map((item) => (
									<div className="question-node">
										<QuestionBox
											messageId={item.messageId}
											statement={item?.statement}
											optionStatement={item?.options?.statement || { en: 'NAN', hi: 'NAN' }}
											langType={langType}
											type="question"
										/>
									</div>
								))}
							</div>
						))
					)}
				</div>
			</div>
		);
	}
}

export default Verification;
