import "../scss/styles.scss";
import { API_URL } from "./config.js";
import $ from "jquery";
import Inputmask from "inputmask";
import validator from "jquery-validation";
import Swal from "sweetalert2";
import { Modal } from "bootstrap";
import Chart from "chart.js/auto";

/**
 * valida email rut.
 * @param campo string
 */
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

/**
 * valida un email.
 * @param campo string
 */
const validaEmail = (campo) => {
	return campo.indexOf("@", 0) == -1 || $("#email").val().indexOf(".", 0) == -1;
};

/**
 * Agrega la funcion validaRut como método al validador
 */
$.validator.addMethod(
	"rut",
	function (value, element) {
		return this.optional(element) || validaRut(value);
	},
	"Debes ingresar un rut válido"
);

/**
 * Agrega funcion para validar alfanumérico como método al validador
 */
$.validator.addMethod(
	"alphanumeric",
	function (value, element) {
		var pattern = /[^a-zA-Z0-9]/;
		return this.optional(element) || !pattern.test(value);
	},
	"El campo debe tener un valor alfanumérico (azAZ09)"
);

/**
 * Agrega la funcion validaEmail como método al validador
 */
$.validator.addMethod(
	"validEmail",
	function (value, element) {
		return this.optional(element) || !validaEmail(value);
	},
	"Debes ingresar un email válido"
);

/**
 * crea la mascara para el rut
 */
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
/**
 *  le asigna la mascara al input
 */
rutMask.mask(document.getElementById("rut"));


$(document).ready(() => {
	/**
	 *  genera una consulta post al servidor
	 * @param endpoint string
	 * @param data object
	 */
	const postApi = async (endpoint, data) => {
		await $.ajax({
			type: "post",
			url: `${API_URL}/${endpoint}`,
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
	/**
	 *  genera una consulta get al servidor
	 * @param endpoint string
	 */
	const getApi = async (endpoint) => {
		return await $.ajax({
			type: "get",
			url: `${API_URL}/${endpoint}`,
			dataType: "json",
		})
			.done((resp) => {
				return resp;
			})
			.fail((err) => {
				console.error(JSON.parse(err.responseText));
			});
	};

	/**
	 *  carga las regiones al select
	 */
	const cargaRegiones = async () => {
		const regiones = await getApi("region");
		$("#region_id").html('<option value="">Seleccione</option>');
		regiones.data.map((region) => {
			$("#region_id").append(`<option value="${region.id}">${region.nombre}</option>`);
		});
	};

	/**
	 *  carga las comunas de una region al select
	 * @param regionId integer
	 */
	const cargaComunas = async (regionId) => {
		$("#comuna_id").html(`<option value="">Cargando...</option>`);
		const comunas = await getApi(`comuna/region/${regionId}`);
		$("#comuna_id").html("");
		comunas.data.map((comuna) => {
			$("#comuna_id").append(`<option value="${comuna.id}">${comuna.nombre}</option>`);
		});
	};

	/**
	 *  carga los candidatos al select
	 */
	const cargaCandidatos = async () => {
		const candidatos = await getApi("candidato");
		$("#candidato").html("");
		candidatos.data.map((candidato) => {
			$("#candidato").append(`<option value="${candidato.id}">${candidato.nombre}</option>`);
		});
	};

	/**
	 *  carga los cómo nos conociste
	 */
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

	/**
	 *  resetea el formulario
	 */
	const reset = () => {
		$("#votacion-form").trigger("reset");
		$("#comuna_id").html(`<option value="">Seleccione</option>`);
	};

	/**
	 *  llama todas las cargas
	 */
	const carga = async () => {
		await (cargaRegiones(), cargaCandidatos(), cargaComoConociste());
		$("#cargando").fadeOut();
	};

	carga();
	reset();

	/**
	 *  carga las comunas onChange
	 */
	$("#region_id").on("change", function (e) {
		cargaComunas($(this).val());
	});

	/**
	 *  valida que no halla votado antes onChange
	 */
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

	/**
	 *  deshabilita submit
	 */
	$("#votacion-form").on("submit", function (e) {
		e.preventDefault();
		return false;
	});

	/**
	 *  muestra modal con resultados
	 */
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

	/**
	 *  reglas y submit del formulario
	 */
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
