const axios = require('axios');
const XLSX = require('xlsx');
const cpfList = [
	'List'
];

async function verifyToken() {
	const url = "https://app-api.prd.quesaude.net/api/v1/auth/pf";
	const headers = {
		"content-type": "application/json"
	}
	const body = {
		"user": "",
		"pass": "",
		"x_device_id": "",
		"origin": "",
		"flag": ""
	}
	try {

		const response = await axios.post(url, data = body, {
			headers: JSON.stringify(headers)
		});
		return response.data.data.access_token
	} catch (error) {
		console.log(error)
	}
}

async function verifyCpf(cpf) {
	console.log(`analisando cpf ${cpf}`)
	const token = await verifyToken()
	const url = `https://app-api.prd.quesaude.net/api/v1/beneficiary/${cpf}`;
	const headers = {
		Authorization: `Bearer ${token}`
	};
	try {
		const response = await axios.get(url, {
			headers
		});
		if (response.data && response.data.payload && response.data.payload.length > 0) {
			return response.data.payload;
		}
		return null;
	} catch (error) {
		console.error(error);
	}
}
async function verifyCpfList(cpfList) {
	const results = [];
	const emptyPayloadCpfs = [];
	for (const cpf of cpfList) {
		const payload = await verifyCpf(cpf);
		if (!payload) {
			console.log(`CPF ${cpf}: []`);
			emptyPayloadCpfs.push(cpf);
		} else {
			results.push({
				cpf,
				payload
			});
			//   console.log(`CPF ${cpf}:`, payload);
		}
	}
	const worksheet = XLSX.utils.json_to_sheet(results);
	const workbook = XLSX.utils.book_new();
	if (emptyPayloadCpfs.length > 0) {
		const emptyPayloadResults = [];
		for (const cpf of emptyPayloadCpfs) {
			emptyPayloadResults.push({
				cpf,
				payload: '[]'
			});
		}
		const emptyPayloadWorksheet = XLSX.utils.json_to_sheet(emptyPayloadResults);
		XLSX.utils.book_append_sheet(workbook, emptyPayloadWorksheet, 'CPFs com Payload Vazio');
	}
	if (results.length > 0) {
		const resultsWorksheet = XLSX.utils.json_to_sheet(results);
		XLSX.utils.book_append_sheet(workbook, resultsWorksheet, 'CPFs com Payload Preenchido');
	}
	XLSX.writeFile(workbook, 'resultado_cpf.xlsx');
}
verifyCpfList(cpfList);