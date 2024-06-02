import { error } from 'jquery';
import toast from 'react-hot-toast';
import io from 'socket.io-client';

const socket = io.connect('/doctor/persona');

export const AddSemantic = (itemid, data, type, setOntologies_data, setTopic_data) => {
	try {
		socket.emit('add_semantic', itemid, data, type, (res) => {
			if (res.status === 'done') {
				if (typeof setTopic_data === 'function') {
					setTopic_data(res.datas.Topic ?? []);
				}
				// ['heart attack', 'liver attack', 'eye problem']

				if (typeof setOntologies_data === 'function') {
					setOntologies_data(res.datas.Ontologies ?? []);
					// ['Ontologies', 'Ontologies attack', 'Ontologies problem', 'Ontologies']
				}
			} else if (res.status === 'error') {
				console.log('error at the get semantic');
			}
		});
	} catch (e) {
		console.log(e);
	}
};
export const EditStatementData = (data, doctor) => {
	console.log(data, ' ', doctor);
	try {
		socket.emit('edit_statement', data, doctor, (response) => {
			if (response.status === 'done') {
				toast.success('Updated Successfully');
			} else if (response.status === 'error') {
				toast.error('Something went wrong');
			}
		});
	} catch (error) {
		console.log(error);
	}
};

export const CreateTransferStatementData = (data) => {
	try {
		socket.emit('create_transfer_statement', data, (response) => {
			if (response.status === 'done') {
				toast.success('Updated Successfully');
			} else if (response.status === 'error') {
				toast.error('Something went wrong');
			}
		});
		toast.success('Updated Successfully');
	} catch (error) {
		console.log(error);
	}
};

export const EditContentVariantData = (data, index) => {
	try {
		socket.emit('edit_content_variant', data, (response) => {
			if (response.status === 'done') {
				toast.success('Updated Successfully');
			} else if (response.status === 'error') {
				toast.error('Something went wrong');
			}
		});
	} catch (error) {
		console.log(error);
	}
};

export const CreateContentVariantData = (data) => {
	try {
		socket.emit('create_content_variant', data, (response) => {
			if (response.status === 'done') {
				toast.success('Updated Successfully');
			} else if (response.status === 'error') {
				toast.error('Something went wrong');
			}
		});
	} catch (error) {
		console.log(error);
	}
};

export const EditOptionsData = (data, doctor) => {
	try {
		socket.emit('edit_option_data', data, doctor, (response) => {
			if (response.status === 'done') {
				toast.success('Updated Successfully');
			} else if (response.status === 'error') {
				toast.error('Something went wrong');
			}
		});
	} catch (error) {
		console.log(error);
	}
};

export const CreateOptionsData = (data, setOptionAlert,setNewContent) => {
	try {
		socket.emit('create_options_data', data, (response) => {
			if (response.status === 'done') {
				toast.success('Updated Successfully');
				setOptionAlert(true);
				setNewContent(response.data??[])
			} else if (response.status === 'error') {
				toast.error('Something went wrong');
				setOptionAlert(false);
			}
		});
	} catch (error) {
		console.log(error);
	}
};

export const EditType = (value, itemid, handleCancelEdit) => {
	try {
		socket.emit('edit_type', value, itemid, (res) => {
			console.log(res);
			if (res.status === 'done') {
				toast.success('Updated Successfully');
				handleCancelEdit();
			} else if (res.status === 'error') {
				toast.error('Something went wrong');
			}
		});
	} catch (e) {
		console.log(e);
	}
};
