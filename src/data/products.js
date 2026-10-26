const sampleProducts = [
  {
    id: 'rosa-croche',
    name: 'Bolsa Rosa Crochê',
    price: 189,
    image: '/images/products/bolsa-rosa-croche.jpg',
    imageAlt: 'Bolsa de crochê rosa com aba bordô e detalhe azul-turquesa',
    description:
      'Crochê rosa com aba bordô e detalhe bordado em azul-turquesa.',
    materials: ['Crochê', 'Bordado'],
    rotation: '-2.5deg',
  },
  {
    id: 'folhas-pintadas',
    name: 'Bolsa Folhas Pintadas',
    price: 219,
    image: '/images/products/bolsa-folhas-pintadas.jpg',
    imageAlt: 'Bolsa de tecido com estampa de folhas coloridas, pintada à mão',
    description:
      'Tecido ilustrado à mão com folhas coloridas, acabamento em crochê preto e alça ajustável.',
    materials: ['Tecido pintado', 'Crochê'],
    rotation: '1.8deg',
  },
  {
    id: 'sacola-azul-com-bolso',
    name: 'Sacola Azul com Bolso',
    price: 239,
    image: '/images/products/sacola-azul-com-bolso.jpg',
    imageAlt: 'Sacola de tecido azul com bolso de crochê bordado com flores',
    description:
      'Sacola de tecido com bolso em crochê azul bordado com flores e alças de crochê.',
    materials: ['Tecido', 'Crochê', 'Bordado'],
    rotation: '-1.2deg',
  },
  {
    id: 'terra-e-turquesa',
    name: 'Bolsa Terra e Turquesa',
    price: 289,
    image: '/images/products/bolsa-terra-turquesa.jpg',
    imageAlt: 'Bolsa artesanal em tons terrosos e turquesa, com contas e pedras',
    description:
      'Bolsa em couro e tecido com faixas turquesa e aplicação de contas e pedras.',
    materials: ['Couro', 'Contas', 'Tricô'],
    rotation: '2.6deg',
  },
  {
    id: 'pink-mix',
    name: 'Bolsa Pink Mix',
    price: 199,
    image: '/images/products/bolsa-pink-mix.jpg',
    imageAlt: 'Bolsa de ombro pink em crochê com fios azuis e turquesa',
    description:
      'Bolsa de ombro em crochê pink com corpo em fios mesclados azul e turquesa.',
    materials: ['Crochê'],
    rotation: '-2deg',
  },
  {
    id: 'mapa-e-beija-flor',
    name: 'Bolsa Mapa e Beija-flor',
    price: 259,
    image: '/images/products/bolsa-mapa-beija-flor.jpg',
    imageAlt: 'Bolsa estampada com mapas antigos e um beija-flor bordado',
    description:
      'Tecido estampado com mapas antigos, beija-flor de paetês e alça de crochê.',
    materials: ['Tecido', 'Paetês', 'Crochê'],
    rotation: '1.4deg',
  },
]

// Repeat the six sample bags three times until the real product list is ready.
export const products = [1, 2, 3].flatMap((copyNumber) =>
  sampleProducts.map((product) => ({
    ...product,
    id: `${product.id}-${copyNumber}`,
  })),
)

export const formatPrice = (price) =>
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price)
