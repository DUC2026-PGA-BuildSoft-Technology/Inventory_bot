# Stakeholder Interviews & Requirements Analysis
Smart-Stock Inventory Bot — Week 12 Verification

This document compiles the transcripts of the stakeholder interviews conducted on **May 23, 2026**, for the **Smart-Stock Inventory Bot** project, and traces them directly to the **Technical Audit Rubric** criteria (Architectural Traceability, Code Maintainability, and UI/UX Integration) to establish complete project validation.

---

## 📈 Requirements Traceability Matrix (Rubric Integration)

The table below maps each stakeholder's core need to the technical implementation and the corresponding grading rubric criteria:

| Persona | Core Business Requirement | Technical Implementation | Rubric Traceability |
| :--- | :--- | :--- | :--- |
| **Owner (David)** | Real-time stock visibility; automatic deduction of sold items; daily reports. | Parameterized queries running atomic database commits; locks (`SELECT FOR UPDATE`) on sales checkouts. | **Stability & Defacement** (Ensures transactional integrity; zero stock count overlaps). |
| **Seller 1 (Chettra)** | Fast communication; instantly check stock when customers ask. | Product catalog displays live stock balances on keyboard buttons (e.g., `Cotton T-Shirt (24)`). | **UI/UX & Integration** (Instant product visibility; no manual command lookups). |
| **Seller 2 (Sochhiet)** | Difficulty generating sales data logs; wants to avoid out-of-stock items. | Dynamic inline keyboard navigation compiles a Sales List; writes to the database `sales` table on checkout. | **UI/UX & Integration** (Eliminates typed arguments; button-driven sales compiles). |
| **Stock Manager** | High rate of manual data entry errors (forgotten logs); wants low-stock notifications. | Automatic database log entries inside the `stock_logs` table; trigger alerts written to `notifications`. | **Code Maintainability** (Modular service functions handle database audits). |

---

## 1. Persona: Owner (David)
**Role:** Business Owner  
**Interviewer:** Panha (Developer)

### 🇰🇭 ភាសាខ្មែរ (Khmer)

**Developer (Panha):** 
ទាក់ទងនឹងគម្រោងកម្មវិធី Telegram Bot តើបងនឹងប្រើប្រាស់វាយ៉ាងដូចម្តេចសម្រាប់អាជីវកម្មរបស់បង? ខ្ញុំដឹងថាបងមានសាខាចំនួន ៣។ តើអ្នកណាខ្លះជាអ្នកប្រើប្រាស់គោល?

**Owner (David):** 
Bot នេះគឺប្រើប្រាស់ជាចម្បងសម្រាប់បុគ្គលិក និងអ្នកគិតលុយ (Cashier)។ ពួកគាត់នឹងប្រើវាដើម្បីឆែកមើលស្តុកទំនិញបានលឿន នៅពេលអតិថិជនសួររកទំនិញណាមួយ។

**Developer (Panha):** 
តើបច្ចុប្បន្នបងគ្រប់គ្រងស្តុកដោយវិធីសាស្ត្រណាដែរ?

**Owner (David):** 
បច្ចុប្បន្ន យើងប្រើវិធីសាស្ត្រដោយដៃ។ បុគ្គលិកត្រូវដើរទៅមើលផ្ទាល់នៅតាមទីតាំងធ្នើរ រួចរាប់ចំនួនទំនិញដើម្បីដឹងថានៅសល់ប៉ុន្មាន។

**Developer (Panha):** 
តើបងចង់ឱ្យ Bot នេះមានមុខងារអ្វីខ្លះ? ដូចជាការបន្ថែមទំនិញ កែប្រែ លក់ ឬក៏ស្វែងរកទំនិញ?

**Owner (David):** 
ខ្ញុំចង់ឱ្យបុគ្គលិកអាចកែប្រែ និងតាមដានទិន្នន័យបានទាំងអស់។ ចំណុចសំខាន់បំផុតគឺការប្រើប្រាស់ Barcode (បាកូដ)។ ពេលអតិថិជនសួររកទំនិញ បុគ្គលិកអាច Scan ឬវាយបញ្ចូល Barcode ដើម្បីដឹងពីចំនួនស្តុកដែលនៅសល់ភ្លាមៗ។ នៅពេលមានការលក់ Bot ត្រូវកាត់ស្តុកដោយស្វ័យប្រវត្តិពីប្រព័ន្ធ ទើបទិន្នន័យស្តុករបស់យើងត្រឹមត្រូវជានិច្ច និងមិនមានការជាន់គ្នា។

**Developer (Panha):** 
តើព័ត៌មានអ្វីខ្លះអំពីទំនិញដែលយើងត្រូវរក្សាទុកក្នុងប្រព័ន្ធ? ដូចជាឈ្មោះ ឬប្រភេទ (Category)?

**Owner (David):** 
បាទ គឺត្រូវមានប្រភេទ (Category) ដូចជា កែវ ស្បែកជើង ខោ ជាដើម។ ហើយទំនិញនីមួយៗត្រូវភ្ជាប់ជាមួយ Barcode ឬលេខកូដសម្គាល់។

**Developer (Panha):** 
តើបងចង់គ្រប់គ្រងលើចំនួន (Quantity) និងតម្លៃ (Price) របស់ទំនិញផងដែរឬទេ?

**Owner (David):** 
បាទ យើងត្រូវដឹងទាំងតម្លៃ និងចំនួនស្តុកសរុបដែលនៅសល់។

**Developer (Panha):** 
តើ Bot នេះគួរប្រើប្រាស់ជាភាសាអ្វីដែរ?

**Owner (David):** 
គួរតែអាចប្រើបានទាំងភាសាអង់គ្លេស និងខ្មែរ។ ប៉ុន្តែសម្រាប់ការវាយបញ្ចូលឈ្មោះ និងកូដទំនិញ (Data Entry) គឺភាគច្រើនប្រើអក្សរឡាតាំង។

**Developer (Panha):** 
ជាចុងក្រោយ ទាក់ទងនឹងការទាញរបាយការណ៍ តើបងចង់បានរបាយការណ៍ប្រចាំថ្ងៃ ឬប្រចាំសប្តាហ៍?

**Owner (David):** 
ខ្ញុំត្រូវការរបាយការណ៍លក់ប្រចាំថ្ងៃ។ របាយការណ៍នោះត្រូវសង្ខេបថាយើងលក់ទំនិញអ្វីខ្លះ លម្អិតតាមប្រភេទ (Category) និងបង្ហាញពីទំហំទឹកប្រាក់លក់បានសរុបប្រចាំថ្ងៃ។

**Developer (Panha):** 
អរគុណច្រើនបង សម្រាប់ការចំណាយពេលឆ្លើយសំណួរទាំងនេះ!

### 🇬🇧 English

**Developer (Panha):** 
Regarding the Telegram bot project, how will this bot be used for your business? I understand you have 3 branches. Who are the primary users going to be?

**Owner (David):** 
The bot is mainly for our staff and cashiers. They will use it to quickly check stock when customers ask about item availability.

**Developer (Panha):** 
How do you currently manage your stock?

**Owner (David):** 
Right now, it's a manual process. Staff have to physically go to the shelves, check the locations, and count the items to see how many are left.

**Developer (Panha):** 
What specific features do you want the bot to have? Should it include adding, editing, selling, or searching for products?

**Owner (David):** 
I want staff to be able to update and track everything. The most important part is barcode integration. When a customer asks if an item is in stock, staff should be able to scan or type the barcode to instantly see the remaining quantity. When an item is sold, the bot needs to automatically deduct it from the system so the inventory is always up to date and doesn't overlap.

**Developer (Panha):** 
What product details do we need to store in the system? Names, categories?

**Owner (David):** 
Yes, it must have categories like glasses, shoes, pants, etc. Every item needs to be linked to a barcode or item code.

**Developer (Panha):** 
Do you also want to track the quantity and price of the items?

**Owner (David):** 
Yes, we need to track both the price and the total stock quantities available.

**Developer (Panha):** 
What language should the bot interface be in?

**Owner (David):** 
It should support both English and Khmer. However, the actual data entry for product names and codes will mostly be in Latin characters.

**Developer (Panha):** 
Lastly, regarding reports, do you need daily or weekly reports?

**Owner (David):** 
I need daily sales reports. The report should summarize what items were sold, provide details by category, and show the total sales value for the day.

**Developer (Panha):** 
Thank you so much for your time and for answering these questions!

---

## 2. Persona: Seller 1 (Chettra)
**Role:** Sales Staff  
**Interviewer:** Panha (Developer)

### 🇰🇭 ភាសាខ្មែរ (Khmer)

**Developer (Panha):** 
សួស្ដីបង! ក្នុងនាមបងជាបុគ្គលិកផ្នែកលក់ តើរាល់ថ្ងៃបងលក់ទំនិញប្រមាណប៉ុន្មានប្រភេទដែរបង?

**Seller 1 (Chettra):** 
រាល់ថ្ងៃយើងមានលក់ទំនិញប្រហែល ៥ ទៅ ៦ ប្រភេទ។

**Developer (Panha):** 
ពេលបងលក់ទំនិញម្ដងៗ តើបងជួបប្រទះបញ្ហាអ្វីខ្លះដែរបង?

**Seller 1 (Chettra):** 
បញ្ហាធំគឺការទំនាក់ទំនងនៅមានភាពយឺតយ៉ាវ។

**Developer (Panha):** 
នៅក្នុងប្រព័ន្ធកម្មវិធីនេះ តើបងចង់ឲ្យខាងប្អូនបន្ថែមមុខងារ (Feature) អ្វីខ្លះ ដើម្បីជួយដោះស្រាយបញ្ហារបស់បង?

**Seller 1 (Chettra):** 
ខ្ញុំចង់ឲ្យកម្មវិធីនេះមានភាពរហ័ស និងងាយស្រួលក្នុងការទំនាក់ទំនង (ឆែកមើលទំនិញបានលឿន)។

**Developer (Panha):** 
អរគុណច្រើនបង។

### 🇬🇧 English

**Developer (Panha):** 
Hello! As a sales staff member, roughly how many types of products do you sell every day?

**Seller 1 (Chettra):** 
Every day, we sell about 5 to 6 types of products.

**Developer (Panha):** 
When you are selling products, what kind of problems do you encounter?

**Seller 1 (Chettra):** 
The main problem is that communication is slow.

**Developer (Panha):** 
In this bot system, what features do you want our team to add to help solve your problem?

**Seller 1 (Chettra):** 
I want the system to be fast and make communication (checking products) easy.

**Developer (Panha):** 
Thank you so much.

---

## 3. Persona: Seller 2 (Sochhiet)
**Role:** Sales Staff  
**Interviewer:** Panha (Developer)

### 🇰🇭 ភាសាខ្មែរ (Khmer)

**Developer (Panha):** 
សួស្ដីបង! ក្នុងនាមបងជាបុគ្គលិកផ្នែកលក់ ខ្ញុំមានសំណួរចង់សួរបង។ តើរាល់ថ្ងៃបងលក់ទំនិញប្រមាណប៉ុន្មានប្រភេទដែរបង?

**Seller 2 (Sochhiet):** 
ចាសបង ទំនិញដែលខ្ញុំលក់មានប្រហែលជា ៥ ទៅ ៦ ប្រភេទ។

**Developer (Panha):** 
ពេលបងលក់ទំនិញម្ដងៗ តើបងជួបប្រទះបញ្ហាអ្វីខ្លះដែរបង?

**Seller 2 (Sochhiet):** 
ខ្ញុំជួបប្រទះបញ្ហាធំៗពីរ។ បញ្ហាទី១ គឺអត់ដឹងថាទំនិញនៅក្នុងស្តុកនៅសល់ចំនួនប៉ុន្មាន។ ហើយបញ្ហាទី២ គឺខ្ញុំពិបាកក្នុងការស្រង់របាយការណ៍ទិន្នន័យទំនិញដែលបានលក់ចេញ។

**Developer (Panha):** 
ទាក់ទងជាមួយនឹងបញ្ហាទាំងពីរហ្នឹង តើបញ្ហាមួយណាដែលបងចំណាយពេលយូរជាងគេ?

**Seller 2 (Sochhiet):** 
គឺបញ្ហាក្នុងការឆែកមើលស្តុកទំនិញ ថាតើឥវ៉ាន់លក់អស់ប៉ុន្មាន និងនៅសល់ប៉ុន្មានហ្នឹងឯង។

**Developer (Panha):** 
ចំពោះកម្មវិធី Telegram Bot ដែលយើងកំពុងធ្វើនេះ តើបងចង់ឲ្យខាងខ្ញុំបន្ថែមមុខងារ (Feature) អ្វីខ្លះ ដើម្បីជួយសម្រួលដល់បញ្ហារបង?

**Seller 2 (Sochhiet):** 
ខ្ញុំចង់ឲ្យបន្ថែមមុខងារដែលអាចមើលស្តុកទំនិញបានលឿន ដើម្បីដឹងថាឥវ៉ាន់នៅសល់ ឬអស់។ ហើយមួយទៀត ចង់ឲ្យបន្ថែមមុខងារសម្រាប់ស្រង់របាយការណ៍ទិន្នន័យនៃការលក់ផងដែរ។

### 🇬🇧 English

**Developer (Panha):** 
Hello! As a sales staff member, I have a question for you. Roughly how many types of products do you sell every day?

**Seller 2 (Sochhiet):** 
Yes, the products I sell consist of about 5 to 6 types.

**Developer (Panha):** 
When selling products, what problems do you usually face?

**Seller 2 (Sochhiet):** 
I face two main problems. First, I don't know exactly how many items are left in stock. Second, it is difficult for me to extract or generate sales data reports.

**Developer (Panha):** 
Regarding those two issues, which one takes up most of your time?

**Seller 2 (Sochhiet):** 
It is the problem of checking the product stock to see how many have been sold and how many are left.

**Developer (Panha):** 
For this Telegram Bot we are building, what features do you want us to add to help ease your problems?

**Seller 2 (Sochhiet):** 
I want you to add a feature to quickly view the stock to know if items are available or out of stock. Additionally, I want a feature to extract sales data reports.

---

## 4. Persona: Stock Manager
**Role:** Stock Management  
**Interviewer:** Panha (Developer)

### 🇰🇭 ភាសាខ្មែរ (Khmer)

**Developer (Panha):** 
សួស្ដីបង! ក្នុងនាមបងជាអ្នកគ្រប់គ្រងស្តុក ខ្ញុំមានសំណួរមួយចំនួនចង់សួររកបង។ នៅពេលគ្រប់គ្រងស្តុកម្តងៗ តើបងជួបប្រទះនឹងបញ្ហាអ្វីខ្លះដែរ?

**Stock Manager:** 
បាទ ក្នុងនាមខ្ញុំជាអ្នកគ្រប់គ្រងស្តុក គឺខ្ញុំជួបបញ្ហាទាក់ទងនឹងការនាំចូលស្តុក (Stock In) និងការនាំចេញស្តុក (Stock Out)។ នៅពេលដែលខ្ញុំកត់ត្រាទិន្នន័យ ភាគច្រើនគឺតែងតែភ្លេចបញ្ចូលទំនិញ (Product) ឬក៏បាត់បង់ទិន្នន័យជាដើមបង។

**Developer (Panha):** 
ប្រសិនបើមានកម្មវិធី Telegram Bot មួយ តើមានមុខងារ (Feature) អ្វីខ្លះដែលបងចង់ដាក់បញ្ចូល ដើម្បីជួយសម្រួលដល់ការគ្រប់គ្រងស្តុករបស់បង?

**Stock Manager:** 
ចំពោះមុខងារ (Feature) គឺខ្ញុំចង់បានដូចជា ការបន្ថែមស្តុក (Add Stock) การនាំចេញស្តុក (Stock Out) និងការកែប្រែបច្ចុប្បន្នភាពស្តុក (Update Stock)។ ដូចជានៅពេលដែលយើងធ្វើការ Stock In យើងចង់ឱ្យមានទិន្នន័យច្បាស់លាស់ ហើយយើងអាចនឹងមានការភ្ជាប់ជាមួយវិក្កយបត្រ (Receipt) បន្ថែម នៅពេលដែលយើង Add ឬ Stock In ទំនិញចូលទៅក្នុងស្តុក។

**Developer (Panha):** 
អរគុណច្រើនបង។ បើមានប្រព័ន្ធផ្ដល់ដំណឹង (Notification) តើបងចង់ឱ្យវាផ្ដល់ដំណឹងនៅពេលណាខ្លះដែរ?

**Stock Manager:** 
ចំពោះការផ្ដល់ដំណឹង (Notification) គឺខ្ញុំចង់ឱ្យមាននៅពេលដែលស្តុកទាប (Low Stock) អស់ស្តុក (Out of Stock) នៅពេលដែលយើងធ្វើការនាំចូលស្តុក (Stock In) និងនៅពេលមានការកែប្រែបច្ចុប្បន្នភាពស្តុក (Stock Update)។

**Developer (Panha):** 
ចុះបើមានការកែប្រែស្តុកម្តងៗ តើបងចង់ឱ្យប្រព័ន្ធផ្ញើរបាយការណ៍ (Report) ទៅកាន់នរណាខ្លះ?

**Stock Manager:** 
ចំពោះការកែប្រែទិន្នន័យស្តុក គឺខ្ញុំចង់ឱ្យវាលោត Report ទៅកាន់ម្ចាស់ហាង (Owner) ខ្លួនយើងផ្ទាល់ជាអ្នកគ្រប់គ្រងស្តុក (Stock Management) និងបុគ្គលិកផ្នែកដទៃទៀត (Staff)។

**Developer (Panha):** 
អរគុណច្រើនបង។

### 🇬🇧 English

**Developer (Panha):** 
Hello! As a stock manager, I have a few questions for you. When managing the stock, what kind of challenges or problems do you encounter?

**Stock Manager:** 
Yes, as a stock manager, I face issues regarding stock-in and stock-out processes. When I manually record the data, I often forget certain products or even lose the data entirely.

**Developer (Panha):** 
If we build a Telegram Bot, what features would you like to include to assist with your stock management?

**Stock Manager:** 
For features, I would like to have Add Stock, Stock Out, and Stock Update capabilities. For instance, when we perform a Stock In, we want to have clear data logged, and we should also be able to attach/generate a receipt or invoice when adding or stocking in products.

**Developer (Panha):** 
Thank you. If there is a notification system, when exactly would you want to receive alerts?

**Stock Manager:** 
For notifications, I want alerts for Low Stock situations, Out of Stock statuses, when a new Stock In happens, and during general Stock Updates.

**Developer (Panha):** 
If there are updates or changes made to the stock data, who should the system send the reports to?

**Stock Manager:** 
For stock adjustments, I want the system to report directly to the Owner, to myself as the Stock Manager, and to the Staff members.

**Developer (Panha):** 
Thank you so much.
