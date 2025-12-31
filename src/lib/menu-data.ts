
export interface MenuItem {
    id: string;
    name: string;
    price: number; // قیمت به تومان
    protein: number; // گرم پروتئین
    ingredients: string;
    category: 'salad' | 'main' | 'breakfast' | 'snack';
    tags: ('low-carb' | 'high-carb' | 'high-protein' | 'balanced' | 'keto' | 'vegan')[];
    snappfood_link: string;
}

const BASE_SNAPPFOOD = "https://m.snappfood.ir/restaurant/menu/%DA%A9%D8%A7%D9%81%D9%87_%D8%A8%D9%88%D8%AA%DB%8C%DA%A9_%D8%B3%D9%84%D8%A7%D9%85%D8%AA%DB%8C_%D8%AD%D8%B3_%D8%AE%D9%88%D8%A8-r-jy2jyq/?from_list=1&is_pickup=0&GAParams=";

export const MENU_ITEMS: MenuItem[] = [
    // --- سالادها (مناسب اندومورف / کات / شام) ---
    {
        id: 'salad-protein',
        name: 'سالاد پروتئینی (ویژه)',
        price: 305000,
        protein: 85,
        ingredients: '۲۰۰ گرم مرغ گریل+ تخم‌مرغ+ مغز تخمه+ لوبیا',
        category: 'salad',
        tags: ['high-protein', 'low-carb', 'keto'],
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'salad-caesar',
        name: 'سالاد سزار (گریل)',
        price: 270000,
        protein: 52,
        ingredients: '۲۰۰ گرم مرغ گریل شده',
        category: 'salad',
        tags: ['high-protein', 'balanced'],
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'salad-greek',
        name: 'سالاد یونانی',
        price: 275000,
        protein: 68,
        ingredients: '۲۰۰ گرم مرغ گریل شده + طعم مدیترانه‌ای',
        category: 'salad',
        tags: ['high-protein', 'low-carb'],
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'salad-quinoa-chicken',
        name: 'سالاد کینوا چیکن',
        price: 295000,
        protein: 75,
        ingredients: '۲۰۰ گرم مرغ+ لوبیا+ کینوا',
        category: 'salad',
        tags: ['high-protein', 'balanced', 'high-carb'], // کینوا کربوهیدرات دارد
        snappfood_link: BASE_SNAPPFOOD
    },

    // --- غذاهای اصلی (ناهار / بعد تمرین) ---
    {
        id: 'steak-fish',
        name: 'استیک ماهی قزل‌آلا',
        price: 410000,
        protein: 44,
        ingredients: '۳۰۰ گرم ماهی + سبزیجات سالم',
        category: 'main',
        tags: ['high-protein', 'low-carb', 'keto'],
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'steak-chicken',
        name: 'استیک مرغ رژیمی',
        price: 370000,
        protein: 70,
        ingredients: '۳۰۰ گرم استیک مرغ گریل',
        category: 'main',
        tags: ['high-protein', 'low-carb'],
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'roast-beef-plate',
        name: 'بشقاب رست‌بیف رژیمی',
        price: 560000,
        protein: 52,
        ingredients: '۳۰۰ گرم راسته گوساله بدون چربی + قارچ',
        category: 'main',
        tags: ['high-protein', 'keto'],
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'panini-roast-beef',
        name: 'پنینی رست‌بیف',
        price: 570000,
        protein: 80,
        ingredients: '۱۵۰ گرم گوشت + پنیر زیرو',
        category: 'main',
        tags: ['high-protein', 'high-carb'], // نان دارد
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'pizza-steak',
        name: 'پیتزا رست‌بیف ایتالیایی',
        price: 560000,
        protein: 55,
        ingredients: 'پروتئین بالا + بدون چربی اضافه',
        category: 'main',
        tags: ['high-carb', 'high-protein'], // اکتومورف پسند
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'veggie-plate',
        name: 'بشقاب سبزیجات پخته',
        price: 160000,
        protein: 10,
        ingredients: 'فیبر بالا + پاکسازی کننده',
        category: 'main',
        tags: ['low-carb', 'vegan'],
        snappfood_link: BASE_SNAPPFOOD
    },

    // --- صبحانه ---
    {
        id: 'oatmeal-banana',
        name: 'اوتمیل موز و شکلات',
        price: 205000,
        protein: 12,
        ingredients: 'شیرین شده با استویا + فیبر بالا',
        category: 'breakfast',
        tags: ['high-carb', 'balanced'],
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'pancake-protein',
        name: 'پنکیک پروتئینی',
        price: 295000,
        protein: 42,
        ingredients: 'پروتئین وی + استویا',
        category: 'breakfast',
        tags: ['high-protein', 'balanced'],
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'iranian-breakfast',
        name: 'صبحانه ایرانی سالم',
        price: 155000,
        protein: 20,
        ingredients: 'ترکیب متعادل پروتئین و چربی مفید',
        category: 'breakfast',
        tags: ['balanced'],
        snappfood_link: BASE_SNAPPFOOD
    },
    {
        id: 'egg-toast',
        name: 'تست تخم‌مرغ',
        price: 165000,
        protein: 28,
        ingredients: 'پروتئین کامل + کربوهیدرات پیچیده',
        category: 'breakfast',
        tags: ['balanced', 'high-protein'],
        snappfood_link: BASE_SNAPPFOOD
    }
];
