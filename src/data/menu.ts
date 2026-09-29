import { MenuItem } from '../types';

export const LOGO_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDLL1KjCv8s3qhLdqSjnngCsg3eOupfkcQC9IMhn_F4K8sh3SEJIvMS4m8J-R5tTkE2rCDmVm3yj55H1lprBj1BzFE0iq4wwW0DHaonWMSi-z_igFVHCK_Abn_DjOi0sElh3avLXHb_Zosa8RVsoBu-kvzO2vG0n_WVDzHMm7nyekANOCaanpy7a-bTa06RpjEVGVxDnVNQuqPWX7oSAm-yJpVrT4Q8zJX0ctP5-Shbmgq4jYkpHGWEDw';

export const AVATAR_URL = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBM3phvoePOzKeTfVVR8QjnRP3mR5gZBbHODe4pJFFFHyCMWQMRHMySJsuh3n2ZyEu71It3o8-dJ-qyfm3SAes5L5iaItQjXAyP-HRCXr_DzPyBJRQvIWU_ojOlT6sgUjw_rWoCvB78yTfSv15TEh2xc0jFlUWqoz0CFlKnCqZSl9YaddzZlprlIOvz7Td3reYbopbyTkBgW7uLY-44zcHBIDS5bwpbejsFuCkr45XRnWFcC6nYwGCSQ';

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'truffle-ember-smash',
    name: 'Truffle Ember Smash',
    category: 'Smashburgers',
    price: 12.49,
    description: 'Double grass-fed smash patties, aged smoked gouda, savory black truffle aioli, charred sweet shallots on toasted brioche bun.',
    calories: 780,
    prepTime: '8-10 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlUNm4zJcjZFgrfU3YesBrPA05Y5yWBcZbxWak9BeUQPUW_3ZeVY-PJE9wa7v_8Sm-gToI3_I7FxI-C7xnMv1JQC9m9QFQa4h_M0f8pxFOczkyAqh1g6AEj8BfOexgI-aGPFIVE4nUCZSWbLzX07Bhgi4QL1ZHZWnH8aCKUTg4g7gEje_m82_ELVLc3PE9U0GDlw5tSXQccFiss-aMeqmTq5lJ7QDInbHNUGaugh6mGWqEnMnkIqDkFw',
    badge: 'NEW DROP',
    badgeType: 'primary',
    isAvailable: true,
    isCustomizable: true,
    dietary: 'Chef Special'
  },
  {
    id: 'hot-honey-crunch-bird',
    name: 'Hot Honey Crunch Bird',
    category: 'Crispy Chicken',
    price: 10.99,
    description: 'Buttermilk dipped chicken thigh, slow-simmered wildflower hot honey, crisp house pickles, creamy cider slaw.',
    calories: 690,
    prepTime: '6-8 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCARjm76ohSRGvMabQTg3HV5hLE_lZ37iKQfOAPUdi4Tq0BKckgmQeT0VAdCJg02JX4EoBqCZ1D-87Zysq9XeTZPLQ7WLSHXdQIuLwZVNmjzKzfiWWlQQAT-_cRmTEQ86vcMi0UVlFDvEG1DzXXzvtM_lqrvEHNQM1H2N6mowDBa-gnGbZe2kFGXzWRTCYPjEmkuK-2_20OWvZPKMFuaA06VLamiOZrJbtSiXgwskvTQ29uHhEIWBaSoA',
    badge: 'MOST LOVED',
    badgeType: 'secondary',
    isAvailable: true,
    isCustomizable: true,
    dietary: 'Halal Certified'
  },
  {
    id: 'loaded-sizzle-fries',
    name: 'Loaded Sizzle Fries',
    category: 'Loaded Fries',
    price: 7.25,
    description: 'Golden skin-on cuts smothered in smash beef bits, charred sweet onions, and molten double cheddar sauce.',
    calories: 540,
    prepTime: '4-6 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDx0zOGB217o8JyFwIQwleDRZluStZgWuWxs2LRDuepvQALjKuwHz9NQKNIPaaq7nbj-OM45nYuHLWOyL71VFVITdwbSSFSN5YvV-uvR3_sPpQex8hXSpt9et379-ZyhnKTVUWGI-NRdqCtpC3IM6JFxyu8RgxN19PorXcmsm8UQjF_HhV9iy7OVhGmZ_wL6UHeb2FWAf1fQgwZ2WF5GQzJPXImRjwJfDTzG3gpgzAHGaWykhotPvR3Fw',
    badge: 'FAN PICK',
    badgeType: 'neutral',
    isAvailable: true,
    dietary: 'Shareable'
  },
  {
    id: 'double-sizzle-smash',
    name: 'The Double Sizzle Smash',
    category: 'Smashburgers',
    price: 13.49,
    description: 'Two fresh 100% Angus beef patties smashed razor-thin with charred caramelized edges, double melty cheddar & signature Ember sauce.',
    calories: 820,
    prepTime: '8-12 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuClRm3N0nDhuETUc_J8IsBtbuFRf0vO59Wb_cr-CY9o6z0iXliOfIZG6_zNuiw1n0FDiqHbQSTuUKQeDAbOg5eaYvcAomKXA19NgEWRDv9I8GeXK4XT4xXDd41BR83YGfkeZGa6Z1UBt2DMxaPlW1RudZTrgRIprsYX3PEmzMxCW3YnPP_HArrhDhkGC_jqSt3lOWri0pgA2Lx1dXVy-ILhdXAOenoVRsS2IkX2Mauy4BopQMbAZ6Il7Q',
    badge: 'CHEF SIGNATURE',
    badgeType: 'secondary',
    isAvailable: true,
    isCustomizable: true,
    dietary: 'Best Seller'
  },
  {
    id: 'spicy-truffle-bird',
    name: 'Spicy Truffle Bird',
    category: 'Crispy Chicken',
    price: 11.25,
    description: 'Crispy chicken breast with rich chili dusting, creamy slaw, dripping honey mustard drizzle inside a warm potato bun.',
    calories: 710,
    prepTime: '7-9 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3XDNBH8aS_m0WrbH8O156MJcbAd6Wv3vna1qhzIK4rtkFS0sUrylYEHKTImkXF-uEciNkh0vYiSS7O3XBu8aErByo-gMSojr-QlyUUgPDUpeOzmJOwgs-Ef8GBIIiC-wjnickkjoQ3YEmvKFczjK3nJWVTJF30nJVnW9t6qkveqxxBqRSz8Vs4DumQt6jW3h_Oc0zjCSxuBmuyUtDOZXyAuiXwtoB-yeNhLbqQUGmL5jvRPK3l6mgLg',
    badge: 'HOT DROP',
    badgeType: 'primary',
    isAvailable: true,
    isCustomizable: true,
    dietary: 'Spicy Favorite'
  },
  {
    id: 'parmesan-truffle-fries',
    name: 'Parmesan Truffle Fries',
    category: 'Loaded Fries',
    price: 5.99,
    description: 'Crispy skin-on fries with shaved black truffle flakes, parmigiano reggiano snow, rosemary needles & garlic herb aioli.',
    calories: 420,
    prepTime: '4-5 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkmVkZgPsw-bIrRAau8uJNP2fe6VaQtf_U6lHqSJ4jKqLuEmWZACbnbyFTlu4RSPGaNmKJPx892RzPGGzq61H_51GQrDAobGjRnDYPhmAI-AeftaZKkCf3QpBCr0iS-Ht4t-qYZ6wkpPSAOH0WaQfhLEvfCIqkq8hotRop6Ou0SszjVkLg1DOlrhAYg9zb_i9YL4Q-jEGXQzMGsTweR1E8w6Fz0sp5Ylb_V2wZaOc7646lE6Dkie5lTw',
    badge: 'TOP SIDE',
    badgeType: 'neutral',
    isAvailable: true,
    dietary: 'Vegetarian'
  },
  {
    id: 'pretzel-shake',
    name: 'Pretzel Shake',
    category: 'Shakes & Sips',
    price: 4.50,
    description: 'Thick gourmet salted caramel pretzel milkshake topped with whipped cream, golden amber caramel drizzle, and pretzel crumbles.',
    calories: 490,
    prepTime: '3-4 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXvornAy1IjoGxWZHSLQ28UgK6hpD0WgoeFp2E1OECrc5JUuZ_8mwP-V9P2XucrKNShUbbrYF9XwOKoL3dSp9MAVkU7MtmZrNXY_EYm91Ouul6y3TcxnHTXIHatKUo0a_H78JBY0YqQoJQzcPWGLtMkjFlziQCH05waeQQyHYq8XfVpvopMD_kff76cOAMoianRzCp2VhGeH5fYUgPRO0v8hJYcYAdbTW9TL3Vka6xJJdYfHwYDapjCw',
    badge: 'PAIRING PICK',
    badgeType: 'secondary',
    isAvailable: true,
    dietary: 'Sweet Treat'
  },
  {
    id: 'smoked-poppers',
    name: 'Smoked Poppers',
    category: 'Loaded Fries',
    price: 3.75,
    description: '3pc crispy golden jalapeño cheese poppers filled with stringy melted cheese and charred chili flakes, house ranch on side.',
    calories: 320,
    prepTime: '3-5 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCySd_B0F-YALIIvXMtS_86XxpZxA7T2lFHpBLo_IjQ60bJe6Br7Bh6P_lSQHX4HLxbT82ptolsGQzmxdlSjipf_CgupdJo4lsLmYgNFNiNGzOfXIvsJ-fS7j3kA4IlL4Ji8JTGABPPTIoON-TjeouyX_v1-IW2S2ZLipUKjMLHNuH-U0ne6l0xDboVNVp_NDLbWjOjwkJR7EdhUoiRUWGCO8uyV9oyBfThQymzbxackW6ItqcOhI8iGA',
    badge: 'SNACK SIDE',
    badgeType: 'neutral',
    isAvailable: true,
    dietary: 'Spicy'
  },
  {
    id: 'beyond-ember-vegan',
    name: 'Beyond Ember Smash',
    category: 'Plant-Based',
    price: 13.99,
    description: '100% plant-based Beyond meat griddled hot with vegan smoked gouda, charred sweet shallots, truffle aioli on vegan potato bun.',
    calories: 640,
    prepTime: '8-10 min',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlUNm4zJcjZFgrfU3YesBrPA05Y5yWBcZbxWak9BeUQPUW_3ZeVY-PJE9wa7v_8Sm-gToI3_I7FxI-C7xnMv1JQC9m9QFQa4h_M0f8pxFOczkyAqh1g6AEj8BfOexgI-aGPFIVE4nUCZSWbLzX07Bhgi4QL1ZHZWnH8aCKUTg4g7gEje_m82_ELVLc3PE9U0GDlw5tSXQccFiss-aMeqmTq5lJ7QDInbHNUGaugh6mGWqEnMnkIqDkFw',
    badge: '100% PLANT',
    badgeType: 'neutral',
    isAvailable: true,
    isCustomizable: true,
    dietary: 'Vegan'
  }
];

export const YOUR_USUAL_ORDERS = [
  {
    id: 'usual-1',
    menuItemId: 'double-sizzle-smash',
    title: 'Double Sizzle Smash',
    sub: 'Combo • Rosemary Fries',
    tag: 'Most Reordered',
    price: 14.80,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBR1s7qEEGpqFaGxHDMq6bjfjFGzHMazOAe1_rpb_59xQ6I0-AG6ZxBga2FqTjXfwt5RRzXVtKU8aODxdJSWw9wSOQiotXLA2xGKrhbNtcpYG5jY1B54yOg8juVBByDDILJDOVXN9H5S_j6ew8MKeGdb1kF87q-jxNUgvgdR_l8Pmimg-OCrPdvOSG0Yv2wq_Yp1dF6XZdzAwYK6RiPg-teJ1boGkGeB2FXvjUX3kwLSIUuOVVMe_prUA'
  },
  {
    id: 'usual-2',
    menuItemId: 'spicy-truffle-bird',
    title: 'Spicy Truffle Bird',
    sub: 'Solo • Extra Aioli',
    tag: 'Spicy Favorite',
    price: 11.25,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC3XDNBH8aS_m0WrbH8O156MJcbAd6Wv3vna1qhzIK4rtkFS0sUrylYEHKTImkXF-uEciNkh0vYiSS7O3XBu8aErByo-gMSojr-QlyUUgPDUpeOzmJOwgs-Ef8GBIIiC-wjnickkjoQ3YEmvKFczjK3nJWVTJF30nJVnW9t6qkveqxxBqRSz8Vs4DumQt6jW3h_Oc0zjCSxuBmuyUtDOZXyAuiXwtoB-yeNhLbqQUGmL5jvRPK3l6mgLg'
  },
  {
    id: 'usual-3',
    menuItemId: 'parmesan-truffle-fries',
    title: 'Truffle Parm Fries',
    sub: 'Large • Truffle Dip',
    tag: 'Snack Side',
    price: 6.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDB8EpTKgnrsHSTpjtHym5sc_7Zk008e_WJARY2Mr158Ph2Ih9mi_8CB7vuFQgUdfBWqvbvV9Dq2BvzjQLvgi3-oY1XIC6HnOkwJ4cvdDJWPN9nvsfXdKio_plr_5isAeRuT5AoawoJQFuXRfXP7CcAhjdi20Xs4mFWxelUrzfpa0IzKi_HuK_Ocw23c4b8A21FhhK4SzYHKB4MFket0S12Zz47IofZjBNuHYCvEhCiZkUAOZaKylAT7w'
  }
];

export const UPSELL_ITEMS = [
  {
    id: 'upsell-1',
    menuItemId: 'pretzel-shake',
    title: 'Pretzel Shake',
    sub: 'Salted caramel swirl',
    price: 4.50,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCXvornAy1IjoGxWZHSLQ28UgK6hpD0WgoeFp2E1OECrc5JUuZ_8mwP-V9P2XucrKNShUbbrYF9XwOKoL3dSp9MAVkU7MtmZrNXY_EYm91Ouul6y3TcxnHTXIHatKUo0a_H78JBY0YqQoJQzcPWGLtMkjFlziQCH05waeQQyHYq8XfVpvopMD_kff76cOAMoianRzCp2VhGeH5fYUgPRO0v8hJYcYAdbTW9TL3Vka6xJJdYfHwYDapjCw'
  },
  {
    id: 'upsell-2',
    menuItemId: 'smoked-poppers',
    title: 'Smoked Poppers',
    sub: '3pc house ranch',
    price: 3.75,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCySd_B0F-YALIIvXMtS_86XxpZxA7T2lFHpBLo_IjQ60bJe6Br7Bh6P_lSQHX4HLxbT82ptolsGQzmxdlSjipf_CgupdJo4lsLmYgNFNiNGzOfXIvsJ-fS7j3kA4IlL4Ji8JTGABPPTIoON-TjeouyX_v1-IW2S2ZLipUKjMLHNuH-U0ne6l0xDboVNVp_NDLbWjOjwkJR7EdhUoiRUWGCO8uyV9oyBfThQymzbxackW6ItqcOhI8iGA'
  }
];
