const products = [
  {
    id: "earl-grey-classic",
    name: "Earl Grey Classic",
    category: "Black Tea",
    price: 12.9,
    rating: 4.8,
    stock: 28,
    origin: "Sri Lanka",
    caffeine: "Medium",
    badge: "Best seller",
    imageTone: "bergamot",
    tastingNotes: ["bergamot", "malt", "citrus"],
    description:
      "Aromatic black tea with bright bergamot and a balanced finish for everyday rituals."
  },
  {
    id: "jasmine-cloud",
    name: "Jasmine Cloud",
    category: "Green Tea",
    price: 14.5,
    rating: 4.7,
    stock: 18,
    origin: "China",
    caffeine: "Low",
    badge: "Floral",
    imageTone: "jasmine",
    tastingNotes: ["jasmine", "grass", "pear"],
    description:
      "Delicate green tea scented with jasmine blossoms, smooth enough for afternoon cups."
  },
  {
    id: "mountain-oolong",
    name: "Mountain Oolong",
    category: "Oolong",
    price: 18.2,
    rating: 4.9,
    stock: 12,
    origin: "Taiwan",
    caffeine: "Medium",
    badge: "Limited",
    imageTone: "oolong",
    tastingNotes: ["orchid", "cream", "stone fruit"],
    description:
      "Rolled high mountain oolong with creamy texture and a long floral aroma."
  },
  {
    id: "chamomile-honey",
    name: "Chamomile Honey",
    category: "Herbal",
    price: 10.8,
    rating: 4.6,
    stock: 35,
    origin: "Egypt",
    caffeine: "None",
    badge: "Calm",
    imageTone: "chamomile",
    tastingNotes: ["honey", "apple", "flowers"],
    description:
      "Caffeine-free chamomile blend with a naturally sweet, cozy profile."
  },
  {
    id: "masala-chai",
    name: "Masala Chai",
    category: "Chai",
    price: 13.4,
    rating: 4.9,
    stock: 24,
    origin: "India",
    caffeine: "High",
    badge: "Spiced",
    imageTone: "chai",
    tastingNotes: ["cardamom", "ginger", "cinnamon"],
    description:
      "Bold black tea with warming spices, designed for milk or oat milk."
  },
  {
    id: "white-peony",
    name: "White Peony",
    category: "White Tea",
    price: 16.9,
    rating: 4.5,
    stock: 16,
    origin: "Fujian",
    caffeine: "Low",
    badge: "Soft",
    imageTone: "peony",
    tastingNotes: ["melon", "hay", "nectar"],
    description:
      "Gentle white tea with soft sweetness and a clean, airy finish."
  },
  {
    id: "hibiscus-berry",
    name: "Hibiscus Berry",
    category: "Herbal",
    price: 11.6,
    rating: 4.4,
    stock: 31,
    origin: "Blend",
    caffeine: "None",
    badge: "Iced tea",
    imageTone: "hibiscus",
    tastingNotes: ["hibiscus", "raspberry", "tart cherry"],
    description:
      "Bright ruby herbal infusion that shines hot or poured over ice."
  },
  {
    id: "sencha-morning",
    name: "Sencha Morning",
    category: "Green Tea",
    price: 15.2,
    rating: 4.7,
    stock: 21,
    origin: "Japan",
    caffeine: "Medium",
    badge: "Fresh",
    imageTone: "sencha",
    tastingNotes: ["sea breeze", "spinach", "sweet corn"],
    description:
      "Steamed Japanese green tea with a vivid, refreshing character."
  },
  {
    id: "peppermint-fields",
    name: "Peppermint Fields",
    category: "Herbal",
    price: 9.9,
    rating: 4.6,
    stock: 42,
    origin: "USA",
    caffeine: "None",
    badge: "Digestive",
    imageTone: "mint",
    tastingNotes: ["mint", "cool finish", "herbs"],
    description:
      "Pure peppermint leaves with a cooling finish after meals."
  },
  {
    id: "breakfast-bold",
    name: "Breakfast Bold",
    category: "Black Tea",
    price: 12.2,
    rating: 4.6,
    stock: 30,
    origin: "Blend",
    caffeine: "High",
    badge: "Morning",
    imageTone: "breakfast",
    tastingNotes: ["malt", "toast", "cocoa"],
    description:
      "Full-bodied breakfast blend built for a dependable morning cup."
  },
  {
    id: "rooibos-vanilla",
    name: "Rooibos Vanilla",
    category: "Herbal",
    price: 11.4,
    rating: 4.5,
    stock: 27,
    origin: "South Africa",
    caffeine: "None",
    badge: "Dessert",
    imageTone: "rooibos",
    tastingNotes: ["vanilla", "almond", "honeybush"],
    description:
      "Naturally sweet rooibos with soft vanilla and no caffeine."
  },
  {
    id: "matcha-ceremony",
    name: "Matcha Ceremony",
    category: "Green Tea",
    price: 24.9,
    rating: 4.8,
    stock: 10,
    origin: "Japan",
    caffeine: "High",
    badge: "Premium",
    imageTone: "matcha",
    tastingNotes: ["umami", "cream", "fresh greens"],
    description:
      "Stone-ground ceremonial matcha for whisked bowls and focused mornings."
  },
  {
    id: "turmeric-ginger",
    name: "Turmeric Ginger",
    category: "Wellness",
    price: 12.7,
    rating: 4.3,
    stock: 25,
    origin: "Blend",
    caffeine: "None",
    badge: "Warm",
    imageTone: "turmeric",
    tastingNotes: ["turmeric", "ginger", "lemon"],
    description:
      "Golden caffeine-free infusion with zingy ginger and citrus brightness."
  },
  {
    id: "darjeeling-first-flush",
    name: "Darjeeling First Flush",
    category: "Black Tea",
    price: 21.5,
    rating: 4.9,
    stock: 8,
    origin: "India",
    caffeine: "Medium",
    badge: "Reserve",
    imageTone: "darjeeling",
    tastingNotes: ["muscatel", "green grape", "flowers"],
    description:
      "Elegant first flush tea with a lifted aroma and crisp spring character."
  },
  {
    id: "lavender-night",
    name: "Lavender Night",
    category: "Wellness",
    price: 13.1,
    rating: 4.4,
    stock: 19,
    origin: "Blend",
    caffeine: "None",
    badge: "Evening",
    imageTone: "lavender",
    tastingNotes: ["lavender", "chamomile", "soft mint"],
    description:
      "A relaxing evening blend with floral calm and a clean finish."
  },
  {
    id: "genmaicha-toast",
    name: "Genmaicha Toast",
    category: "Green Tea",
    price: 14.1,
    rating: 4.6,
    stock: 22,
    origin: "Japan",
    caffeine: "Low",
    badge: "Toasty",
    imageTone: "genmaicha",
    tastingNotes: ["toasted rice", "seaweed", "butter"],
    description:
      "Green tea blended with roasted rice for a savory, comforting cup."
  },
  {
    id: "cacao-puerh",
    name: "Cacao Puerh",
    category: "Pu-erh",
    price: 19.4,
    rating: 4.5,
    stock: 13,
    origin: "Yunnan",
    caffeine: "Medium",
    badge: "Earthy",
    imageTone: "cacao",
    tastingNotes: ["cacao", "forest floor", "molasses"],
    description:
      "Dark fermented tea layered with cacao nibs for a rich, grounding profile."
  },
  {
    id: "lemon-verveine",
    name: "Lemon Verveine",
    category: "Herbal",
    price: 10.5,
    rating: 4.2,
    stock: 26,
    origin: "France",
    caffeine: "None",
    badge: "Citrus",
    imageTone: "lemon",
    tastingNotes: ["lemon", "verbena", "fresh herbs"],
    description:
      "Clean lemon verbena infusion with a bright aromatic lift."
  },
  {
    id: "coconut-oolong",
    name: "Coconut Oolong",
    category: "Oolong",
    price: 17.6,
    rating: 4.4,
    stock: 15,
    origin: "Blend",
    caffeine: "Medium",
    badge: "Creamy",
    imageTone: "coconut",
    tastingNotes: ["coconut", "cream", "orchid"],
    description:
      "Smooth oolong with toasted coconut and a lightly creamy body."
  },
  {
    id: "rose-black",
    name: "Rose Black",
    category: "Black Tea",
    price: 13.8,
    rating: 4.4,
    stock: 20,
    origin: "Blend",
    caffeine: "Medium",
    badge: "Romantic",
    imageTone: "rose",
    tastingNotes: ["rose", "malt", "red fruit"],
    description:
      "Classic black tea lifted by rose petals and a gentle fruit note."
  },
  {
    id: "apple-cinnamon",
    name: "Apple Cinnamon",
    category: "Herbal",
    price: 11.2,
    rating: 4.3,
    stock: 29,
    origin: "Blend",
    caffeine: "None",
    badge: "Cozy",
    imageTone: "apple",
    tastingNotes: ["apple", "cinnamon", "clove"],
    description:
      "Comforting herbal blend with baked apple character and soft spice."
  },
  {
    id: "kukicha-stem",
    name: "Kukicha Stem",
    category: "Green Tea",
    price: 13.6,
    rating: 4.1,
    stock: 17,
    origin: "Japan",
    caffeine: "Low",
    badge: "Light",
    imageTone: "kukicha",
    tastingNotes: ["hazelnut", "grass", "cucumber"],
    description:
      "Twig tea with low caffeine, gentle nuttiness, and a refreshing finish."
  },
  {
    id: "smoked-lapsang",
    name: "Smoked Lapsang",
    category: "Black Tea",
    price: 15.8,
    rating: 4.2,
    stock: 11,
    origin: "China",
    caffeine: "High",
    badge: "Bold",
    imageTone: "smoked",
    tastingNotes: ["pine smoke", "leather", "molasses"],
    description:
      "Deep smoky black tea for users who want a dramatic cup."
  },
  {
    id: "mango-cold-brew",
    name: "Mango Cold Brew",
    category: "Iced Tea",
    price: 12.5,
    rating: 4.5,
    stock: 33,
    origin: "Blend",
    caffeine: "Low",
    badge: "Summer",
    imageTone: "mango",
    tastingNotes: ["mango", "green tea", "tropical fruit"],
    description:
      "Fruit-forward blend made for easy overnight cold brewing."
  }
];

const categories = [...new Set(products.map((product) => product.category))].sort();

module.exports = {
  products,
  categories
};