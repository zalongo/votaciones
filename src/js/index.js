import "../scss/styles.scss";
import $ from "jquery";
import Inputmask from "inputmask";
import validator from "jquery-validation";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import Chart from "chart.js/auto";

const validaRut = (campo) => {
	if (campo.length == 0) {
		return false;
	}
	if (campo.length < 8) {
		return false;
	}

	campo = campo.replace("-", "");
	campo = campo.replace(/\./g, "");

	let u = "";
	let suma = 0;
	let caracteres = "1234567890kK";
	let contador = 0;
	for (let i = 0; i < campo.length; i++) {
		u = campo.substring(i, i + 1);
		if (caracteres.indexOf(u) != -1) contador++;
	}
	if (contador == 0) {
		return false;
	}

	let rut = campo.substring(0, campo.length - 1);
	let drut = campo.substring(campo.length - 1);
	let dvr = "0";
	let mul = 2;

	for (let i = rut.length - 1; i >= 0; i--) {
		suma = suma + rut.charAt(i) * mul;
		if (mul == 7) mul = 2;
		else mul++;
	}
	let res = suma % 11;
	if (res == 1) dvr = "k";
	else if (res == 0) dvr = "0";
	else {
		let dvi = 11 - res;
		dvr = dvi + "";
	}
	if (dvr != drut.toLowerCase()) {
		return false;
	} else {
		return true;
	}
};

const validaEmail = (campo) => {
	return campo.indexOf("@", 0) == -1 || $("#email").val().indexOf(".", 0) == -1;
};

$.validator.addMethod(
	"rut",
	function (value, element) {
		return this.optional(element) || validaRut(value);
	},
	"Debes ingresar un rut válido"
);

$.validator.addMethod(
	"alphanumeric",
	function (value, element) {
		var pattern = /[^a-zA-Z0-9]/;
		return this.optional(element) || !pattern.test(value);
	},
	"El campo debe tener un valor alfanumérico (azAZ09)"
);

$.validator.addMethod(
	"validEmail",
	function (value, element) {
		return this.optional(element) || !validaEmail(value);
	},
	"Debes ingresar un email válido"
);

const rutMask = new Inputmask({
	mask: "(9(.999){2}-K)|(99(.999){2}-K)",
	autoUnmask: true,
	keepStatic: true,
	showMaskOnFocus: false,
	showMaskOnHover: false,
	definitions: {
		K: {
			validator: "[0-9|kK]",
			casing: "upper",
		},
	},
});

rutMask.mask(document.getElementById("rut"));

const urlBase = "http://votaciones_back.test";

$(document).ready(() => {
	const postApi = async (endpoint, data) => {
		await $.ajax({
			type: "post",
			url: `${urlBase}/${endpoint}`,
			data,
			dataType: "json",
		})
			.done((resp) => {
				return resp;
			})
			.fail((err) => {
				console.error(JSON.parse(err.responseText));
			});
	};
	const getApi = async (endpoint) => {
		return await $.ajax({
			type: "get",
			url: `${urlBase}/${endpoint}`,
			dataType: "json",
		})
			.done((resp) => {
				return resp;
			})
			.fail((err) => {
				console.error(JSON.parse(err.responseText));
			});
	};

	const cargaRegiones = async () => {
		const regiones = await getApi("region");
		$("#region_id").html('<option value="">Seleccione</option>');
		regiones.data.map((region) => {
			$("#region_id").append(`<option value="${region.id}">${region.nombre}</option>`);
		});
	};

	const cargaComunas = async (regionId) => {
		$("#comuna_id").html(`<option value="">Cargando...</option>`);
		const comunas = await getApi(`comuna/region/${regionId}`);
		$("#comuna_id").html("");
		comunas.data.map((comuna) => {
			$("#comuna_id").append(`<option value="${comuna.id}">${comuna.nombre}</option>`);
		});
	};

	const cargaCandidatos = async () => {
		const candidatos = await getApi("candidato");
		$("#candidato").html("");
		candidatos.data.map((candidato) => {
			$("#candidato").append(`<option value="${candidato.id}">${candidato.nombre}</option>`);
		});
	};

	const cargaComoConociste = async () => {
		const como = await getApi("como-conociste");
		$("#como-conociste-options").html("");
		como.data.map((c) => {
			const input = `<div class="form-check">
				<input type="checkbox" id="como_${c.id}" class="form-check-input" name="como_conociste[]" placeholder="" value="${c.id}" />
				<label for="como_${c.id}" class="form-check-label">${c.descripcion}</label>
			</div>`;
			$("#como-conociste-options").append(input);
		});
	};

	const reset = () => {
		$("#votacion-form").trigger("reset");
		$("#comuna_id").html(`<option value="">Seleccione</option>`);
	};

	const carga = async () => {
		await (cargaRegiones(), cargaCandidatos(), cargaComoConociste());
		$("#cargando").fadeOut();
	};

	carga();
	reset();

	$("#region_id").on("change", function (e) {
		cargaComunas($(this).val());
	});

	$("#rut").on("change", function (e) {
		getApi(`votacion/existe/${$(this).val()}`).catch((err) => {
			const error = JSON.parse(err.responseText);
			Swal.fire({
				icon: "error",
				title: "error...",
				text: error.message,
			});
		});
	});

	$("#votacion-form").on("submit", function (e) {
		e.preventDefault();
		return false;
	});

	$("#get-resultados").on("click", async function () {
		$("#cargando").fadeIn();
		const resultados = await getApi("votacion/resultados");
		var modalResultados = new Modal(document.getElementById("modal-resultados"), {
			keyboard: false,
		});
		modalResultados.show();
		$("#cargando").fadeOut();
		console.log($("#resultados"));
		new Chart($("#resultados"), {
			type: "pie",
			data: {
				labels: resultados.data.map((row) => row.nombre),
				datasets: [
					{
						data: resultados.data.map((row) => parseInt(row.votos)),
					},
				],
			},
		});
	});

	/*
	const modalResultados = document.getElementById("modal-resultados");

	modalResultados.addEventListener("show.bs.modal", async (event)=> {
	}); */

	$("#votacion-form").validate({
		rules: {
			rut: {
				required: true,
				rut: true,
			},
			nombre: {
				required: true,
			},
			alias: {
				required: true,
				minlength: 5,
				alphanumeric: true,
			},
			email: {
				required: true,
				validEmail: true,
			},
			region_id: {
				required: true,
			},
			comuna_id: {
				required: true,
			},
			candidato: {
				required: true,
			},
			"como_conociste[]": {
				required: true,
				minlength: 2,
			},
		},
		messages: {
			rut: {
				required: "Debes ingresar tu rut",
				rut: "Debes ingresar un rut válido",
			},
			nombre: {
				required: "Debes ingresar tu nombre",
			},
			alias: {
				minlength: "Debes ingresar al menos 5 caracteres",
				required: "Debes ingresar tu alias",
				alphanumeric: "Debes ingresar caracteres numéricos y letras",
			},
			email: {
				required: "Debes ingresar tu email",
				email: "Debes ingresar un email válido",
			},
			region_id: {
				required: "Debes seleccionar tu región",
			},
			comuna_id: {
				required: "Debes seleccionar tu comuna",
			},
			candidato: {
				required: "Debes seleccionar un candidato",
			},
			"como_conociste[]": {
				required: "No nos has dicho cómo nos conociste",
				minlength: "Debes seleccionar al menos 2",
			},
		},
		errorPlacement: function (error, element) {
			if ($(element).attr("type") == "checkbox") {
				error.appendTo($(element).parents(".col-12"));
			} else {
				error.insertAfter($(element));
			}
		},
		submitHandler: async function (form) {
			$("#cargando").fadeIn();
			const data = $(form).serialize();
			await postApi("votacion/guarda", data)
				.then((resp) => {
					reset();

					Swal.fire({
						icon: "success",
						title: "OK",
						text: "Tu votación ha sido guardada",
					});
				})
				.catch((err) => {
					const error = JSON.parse(err.responseText);
					Swal.fire({
						icon: "error",
						title: "Error",
						text: error.message,
					});
				});
			$("#cargando").fadeOut();
		},
	});
});
