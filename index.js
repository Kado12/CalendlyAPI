require('dotenv').config()
const token = process.env.TOKEN

const express = require('express')

const app = express()
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.get('/', async (req, res) => {

  let disponibles = await getAvailability('25/11/2024', '05:00', '16:00', 'Cerrador 1')
  console.log(disponibles)
  // Define los parámetros que quieres enviar
  const endTime = '2024-11-26T24:00:00.000000Z';
  const eventType = 'https://api.calendly.com/event_types/85c16b72-de3c-42f9-a411-c680ba7cfc76';
  const startTime = '2024-11-26T00:00:00.000000Z';

  // Crea una cadena de consulta con los parámetros
  const params = new URLSearchParams({
    end_time: endTime,
    event_type: eventType,
    start_time: startTime
  }).toString();

  const url = `https://api.calendly.com/event_type_available_times?${params}`;

  try {
    const response = await fetch(`${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    // console.log(json)
    res.json(json); // Envía la respuesta JSON al cliente
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error fetching data from Calendly API' });
  }
})

async function getAvailability(fecha_agendar, hora_cliente, hora_agendar, asesor) {

  const current_day = new Date()
  const current_day_ISO = current_day.toISOString() // Dia actual en formato ISO
  const isoTime = current_day.toISOString().split('T')[1].substring(0, 5) // Hora actual en formato ISO
  const isoTimeAdd = await addHoursToTime(isoTime, -1)
  const isoDay = current_day.toISOString().split('T')[0] // Día actual en formato ISO
  const fecha_agendar_ISO = await transformarFecha(fecha_agendar) // Fecha que quiere agendar en formato ISO

  const differenceHours = await calculateHourDifference(hora_cliente, isoTime) // Diferencia Horaria
  const hora_cliente_ISO = await addHoursToTime(hora_cliente, differenceHours) // Hora del cliente en formato ISO
  const hora_agendar_existe = (hora_agendar.length > 0)
  let disponibilidad = false
  let fechas_disponibles
  console.log(current_day)
  console.log(current_day_ISO)
  console.log(isoTime)
  console.log(fecha_agendar_ISO == isoDay)

  console.log(fecha_agendar_ISO)
  let new_fecha_agendar = `${fecha_agendar_ISO.split('-')[0]}-${fecha_agendar_ISO.split('-')[1]}-${Number(fecha_agendar_ISO.split('-')[2]) + 1}`

  if (fecha_agendar_ISO == isoDay || current_day_ISO < `${isoDay}T05:00:00.000000Z`) {
    if (fecha_agendar_ISO != isoDay) {
      new_fecha_agendar = ''
    }
    if (asesor = 'Cerrador 1') {
      fechas_disponibles = await buscarFechasDisponibles(`${isoDay}T${isoTimeAdd}.00.000000Z`, `${new_fecha_agendar || isoDay}T05:00:00.000000Z`, differenceHours, process.env.URI_HOLOS_EVENTS)
      if (fechas_disponibles.collection.length != 0) {
        disponibilidad = true
      } else {
        fechas_disponibles = await buscarFechasDisponibles(`${isoDay}T${isoTimeAdd}.00.000000Z`, `${new_fecha_agendar || isoDay}T05:00:00.000000Z`, differenceHours, process.env.URI_DEMO_EVENTS)
        if (fechas_disponibles.collection.length != 0) {
          disponibilidad = true
        }
      }

    } else if (asesor = 'Cerrador 2') {
      fechas_disponibles = await buscarFechasDisponibles(`${isoDay}T${isoTimeAdd}.00.000000Z`, `${new_fecha_agendar || isoDay}T05:00:00.000000Z`, differenceHours, process.env.URI_DEMO_EVENTS)
      if (fechas_disponibles.collection.length != 0) {
        disponibilidad = true
      } else {
        fechas_disponibles = await buscarFechasDisponibles(`${isoDay}T${isoTimeAdd}.00.000000Z`, `${new_fecha_agendar || isoDay}T05:00:00.000000Z`, differenceHours, process.env.URI_DEMO_EVENTS)
        if (fechas_disponibles.collection.length != 0) {
          disponibilidad = true
        }
      }
    }
    if (disponibilidad) {
      console.log(fechas_disponibles)
      return
    }
    new_fecha_agendar = `${fecha_agendar_ISO.split('-')[0]}-${fecha_agendar_ISO.split('-')[1]}-${Number(fecha_agendar_ISO.split('-')[2]) + 1}`
  }

  while (disponibilidad = false) {
    if (asesor = 'Cerrador 1') {
      fechas_disponibles = await buscarFechasDisponibles(`${fecha_agendar_ISO}T06:00.00.000000Z`, `${new_fecha_agendar}T05:00:00.000000Z`, differenceHours, process.env.URI_HOLOS_EVENTS)
      if (fechas_disponibles.collection.length != 0) {
        disponibilidad = true
      } else {
        fechas_disponibles = await buscarFechasDisponibles(`${fecha_agendar_ISO}T06:00.00.000000Z`, `${new_fecha_agendar}T05:00:00.000000Z`, differenceHours, process.env.URI_DEMO_EVENTS)
        if (fechas_disponibles.collection.length != 0) {
          disponibilidad = true
        }
      }

    } else if (asesor = 'Cerrador 2') {
      fechas_disponibles = await buscarFechasDisponibles(`${fecha_agendar_ISO}T06:00.00.000000Z`, `${new_fecha_agendar}T05:00:00.000000Z`, differenceHours, process.env.URI_DEMO_EVENTS)
      if (fechas_disponibles.collection.length != 0) {
        disponibilidad = true
      } else {
        fechas_disponibles = await buscarFechasDisponibles(`${fecha_agendar_ISO}T06:00.00.000000Z`, `${new_fecha_agendar}T05:00:00.000000Z`, differenceHours, process.env.URI_DEMO_EVENTS)
        if (fechas_disponibles.collection.length != 0) {
          disponibilidad = true
        }
      }
    }
  }

  console.log(fechas_disponibles)
  return
}

async function buscarFechasDisponibles(fecha_inicio, fecha_final, differenceHours, asesor) {
  const params = new URLSearchParams({
    end_time: fecha_final,
    event_type: asesor,
    start_time: fecha_inicio
  }).toString()

  const url = `https://api.calendly.com/event_type_available_times?${params}`

  try {
    const response = await fetch(`${url}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Authorization': 'Bearer ' + token
      }
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const json = await response.json();
    const new_json = updateStartTime(json, differenceHours)
    return new_json
  } catch (err) {
    console.error('Error:', err);
    throw new Error("Error fetching data from Calendly API")
  }
}

async function transformarFecha(fechaOriginal) {
  // Separar la fecha en partes
  const partes = fechaOriginal.split('/')

  // Asegurarse de que la fecha tenga el formato correcto
  if (partes.length !== 3) {
    throw new Error('Formato de fecha inválido. Debe ser dd/mm/yyyy');
  }

  // Obtener el día, mes y año
  const dia = partes[0];
  const mes = partes[1];
  const age = partes[2];

  // Formatear la fecha en el nuevo formato 'yyyy-mm-dd'
  const fechaTransformada = `${age}-${mes}-${dia}`;

  return fechaTransformada;
}

async function calculateHourDifference(hora_cliente, isoTime) {
  const [hours1, minutes1] = hora_cliente.split(':').map(Number);
  const [hours2, minutes2] = isoTime.split(':').map(Number);
  if (hours1 > hours2) {
    return (hours1 - (hours2 + 24))
  }
  return hours1 - hours2
}

// Función para aumentar las horas en el JSON
async function updateStartTime(data, hours) {
  const updatedCollection = data.collection.map(item => {
    const startTime = new Date(item.start_time); // Convertir a objeto Date
    startTime.setHours(startTime.getHours() + hours); // Aumentar las horas
    return {
      ...item, // Mantener el resto de las propiedades
      start_time: startTime.toISOString() // Actualizar el start_time
    };
  });

  return {
    ...data,
    collection: updatedCollection // Retornar el nuevo objeto con la colección actualizada
  };
}

async function addHoursToTime(timeString, hoursToAdd) {
  // Dividir la cadena de tiempo en horas y minutos
  const [hours, minutes] = timeString.split(':').map(Number);

  // Crear un objeto Date con la hora y minutos proporcionados
  const date = new Date();
  date.setHours(hours);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  // Sumar las horas
  date.setHours(date.getHours() - hoursToAdd);

  // Obtener el nuevo tiempo en formato 'HH:mm'
  const newHours = String(date.getHours()).padStart(2, '0'); // Asegurarse de que sean 2 dígitos
  const newMinutes = String(date.getMinutes()).padStart(2, '0'); // Asegurarse de que sean 2 dígitos

  return `${newHours}:${newMinutes}`;
}

async function updateUserResponsible(leadId, tokenKommo, responsible_id) {
  var payload = JSON.stringify({ responsible_user_id: `${responsible_id}` });
  var optionsPatch = {
    method: 'patch',
    headers: {
      'Accept': 'application/json',
      'Authorization': 'Bearer ' + tokenKommo,
      'Content-Type': 'application/json',
      'muteHttpExceptions': true
    },
    payload: payload
  };

  fetch('https://subdomain.kommo.com/api/v4/leads/488799', optionsPatch)
    .then(res => res.json())
    .then(res => console.log(res))
    .catch(err => console.error(err));
}

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})