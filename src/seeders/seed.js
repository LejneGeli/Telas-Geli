const bcrypt = require('bcrypt');
const {
  sequelize,
  User,
  Customer,
  Address,
  ScreenType,
  ServiceRequest,
  MeasurementVisit,
  RequestItem
} = require('../models');

const names = [
  'Ana Souza', 'Bruno Lima', 'Carla Martins', 'Diego Alves', 'Elisa Ferreira', 'Felipe Rocha',
  'Gabriela Nunes', 'Henrique Costa', 'Isabela Pereira', 'João Santos', 'Karen Oliveira',
  'Lucas Almeida', 'Mariana Gomes', 'Nicolas Ribeiro', 'Patrícia Moreira', 'Rafael Castro',
  'Sofia Mendes', 'Thiago Barbosa', 'Vanessa Teixeira', 'William Cardoso', 'Aline Farias',
  'Caio Duarte', 'Daniela Reis', 'Eduardo Lopes', 'Fernanda Freitas', 'Gustavo Cunha',
  'Helena Moraes', 'Igor Batista', 'Juliana Campos', 'Leandro Pinto', 'Marta Vieira',
  'Otávio Ramos', 'Priscila Dias', 'Renato Araújo', 'Simone Machado', 'Talita Monteiro',
  'Vitor Martins', 'Yasmin Carvalho', 'Zeca Andrade', 'Bianca Melo'
];

const streets = ['Rua das Flores', 'Avenida Brasil', 'Rua do Sol', 'Rua das Acácias', 'Avenida Central', 'Rua dos Ipês'];
const neighborhoods = ['Centro', 'Jardim América', 'Vila Nova', 'Boa Vista', 'Santa Clara', 'Parque das Águas'];
const rooms = ['Quarto', 'Sala', 'Cozinha', 'Sacada', 'Lavanderia', 'Banheiro'];
const statuses = ['pending', 'waiting_measurement', 'measured', 'budget_sent', 'approved', 'scheduled', 'completed'];

async function upsertUser({ name, email, password, role }) {
  const password_hash = await bcrypt.hash(password, 10);
  const [user, created] = await User.findOrCreate({
    where: { email },
    defaults: { name, email, password_hash, role }
  });
  if (!created) {
    await user.update({ name, role });
  }
  return user;
}

async function runSeed() {
  await sequelize.authenticate();

  const admin = await upsertUser({
    name: 'Administrador Mosquiteiras',
    email: 'admin@mosquiteiras.local',
    password: '123456',
    role: 'admin'
  });

  const professional = await upsertUser({
    name: 'Profissional de Medição',
    email: 'profissional@mosquiteiras.local',
    password: '123456',
    role: 'professional'
  });

  const attendant = await upsertUser({
    name: 'Atendente Comercial',
    email: 'atendente@mosquiteiras.local',
    password: '123456',
    role: 'attendant'
  });

  const screenTypesData = [
    ['Tela mosquiteira fixa', 'Modelo fixo para janelas pequenas e médias.', 140.00],
    ['Tela mosquiteira de correr', 'Modelo de correr para portas e janelas com trilho.', 220.00],
    ['Tela mosquiteira magnética', 'Modelo removível com fechamento magnético.', 190.00],
    ['Tela mosquiteira enrolável', 'Modelo retrátil para portas e janelas.', 280.00],
    ['Tela para porta de sacada', 'Instalação indicada para portas maiores.', 320.00],
    ['Manutenção de tela', 'Reparo ou ajuste em tela já instalada.', 90.00],
    ['Troca de tela danificada', 'Substituição de malha danificada.', 120.00],
    ['Visita técnica de medição', 'Serviço para medir os vãos antes do orçamento.', 0.00]
  ];

  const screenTypes = [];
  for (const [name, description, base_price] of screenTypesData) {
    const [screenType] = await ScreenType.findOrCreate({
      where: { name },
      defaults: { name, description, base_price, is_available: true }
    });
    screenTypes.push(screenType);
  }

  if (await Customer.count() >= 40) {
    console.log('Dados de teste já existem. Seed não duplicada.');
    return;
  }

  const createdCustomers = [];
  const createdAddresses = [];

  for (let index = 0; index < names.length; index += 1) {
    const customer = await Customer.create({
      name: names[index],
      email: `cliente${index + 1}@email.com`,
      phone: `119${String(80000000 + index).slice(1)}`,
      document: `000000000${String(index + 1).padStart(2, '0')}`
    });

    const address = await Address.create({
      customer_id: customer.id,
      street: streets[index % streets.length],
      number: String(100 + index),
      neighborhood: neighborhoods[index % neighborhoods.length],
      city: 'Atibaia',
      state: 'SP',
      zip_code: `1294${String(index).padStart(4, '0')}`,
      complement: index % 3 === 0 ? `Apto ${index + 10}` : null
    });

    createdCustomers.push(customer);
    createdAddresses.push(address);
  }

  for (let index = 0; index < 120; index += 1) {
    const customer = createdCustomers[index % createdCustomers.length];
    const address = createdAddresses[index % createdAddresses.length];
    const measurementRequired = index % 3 !== 0;
    const status = measurementRequired ? statuses[index % statuses.length] : ['pending', 'budget_sent', 'approved', 'completed'][index % 4];

    const serviceRequest = await ServiceRequest.create({
      customer_id: customer.id,
      address_id: address.id,
      status,
      measurement_required: measurementRequired,
      description: measurementRequired
        ? 'Cliente solicitou visita técnica para medir janelas e portas antes do orçamento.'
        : 'Cliente informou medidas aproximadas para orçamento inicial.',
      preferred_date: `2026-07-${String((index % 25) + 1).padStart(2, '0')}`,
      total_estimated_price: 0
    });

    if (measurementRequired) {
      await MeasurementVisit.create({
        service_request_id: serviceRequest.id,
        professional_id: professional.id,
        scheduled_date: new Date(2026, 6, (index % 25) + 1, 9 + (index % 8), 0, 0),
        status: ['pending', 'scheduled', 'completed'][index % 3],
        notes: 'Visita técnica para medição dos vãos e avaliação do tipo de tela.'
      });
    }

    const itemCount = 1 + (index % 3);
    let total = 0;

    for (let itemIndex = 0; itemIndex < itemCount; itemIndex += 1) {
      const screenType = screenTypes[(index + itemIndex) % (screenTypes.length - 1)];
      const quantity = 1 + ((index + itemIndex) % 4);
      const width = measurementRequired && status === 'waiting_measurement' ? null : Number((0.80 + ((index + itemIndex) % 6) * 0.15).toFixed(2));
      const height = measurementRequired && status === 'waiting_measurement' ? null : Number((0.90 + ((index + itemIndex) % 5) * 0.20).toFixed(2));
      const unitPrice = Number(screenType.base_price);
      const totalPrice = Number((unitPrice * quantity).toFixed(2));
      total += totalPrice;

      await RequestItem.create({
        service_request_id: serviceRequest.id,
        screen_type_id: screenType.id,
        quantity,
        width,
        height,
        room: rooms[(index + itemIndex) % rooms.length],
        notes: measurementRequired ? 'Medidas podem ser confirmadas após visita técnica.' : 'Medidas informadas pelo cliente.',
        unit_price: unitPrice,
        total_price: totalPrice
      });
    }

    await serviceRequest.update({ total_estimated_price: total });
  }

  console.log(`Seed criada com usuários, ${createdCustomers.length} clientes e 120 pedidos.`);
  console.log('Login padrão: admin@mosquiteiras.local / 123456');
  console.log(`Usuários adicionais: ${professional.email}, ${attendant.email}`);
}

module.exports = { runSeed };
