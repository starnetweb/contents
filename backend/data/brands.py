"""
Brand definitions with platform intelligence baked in.
Each brand includes: niche, audience, platforms, optimal post times,
hashtag banks, content tone, and algorithm notes per platform.
"""

BRANDS = [
    {
        "name": "Blazingprojects",
        "slug": "blazingprojects",
        "description": "Undergraduate and Postgraduate research App/Service",
        "website": "https://blazingprojects.com",
        "niche": "academic research, project writing, undergraduate & postgraduate education",
        "target_audience": "Nigerian university students (100L–Masters), aged 18–28, facing project/thesis deadlines",
        "platforms": ["instagram", "facebook", "tiktok", "youtube", "twitter"],
        "telegram_env_key": "TELEGRAM_BLAZINGPROJECTS_CHAT_ID",
        "content_tone": "helpful, academic but friendly, motivational, relatable to student struggles",
        "search_keywords": [
            "Nigerian university news", "ASUU strike update", "student research tips Nigeria",
            "undergraduate project writing", "postgraduate studies Nigeria", "NYSC news"
        ],
        "platform_strategy": {
            "instagram": {
                "best_times": ["08:00", "20:00"],
                "content_mix": "60% carousel (study tips, research guides), 40% reels (quick tips)",
                "hashtags": ["#ResearchHelp", "#NaijaStudents", "#FinalYearProject",
                             "#UndergraduateNigeria", "#ProjectWriting", "#NigerianUniversity",
                             "#PostgraduateNigeria", "#StudentLife"],
                "algorithm_note": "Carousels get saved → saves boost reach. Post research tips as swipeables."
            },
            "tiktok": {
                "best_times": ["19:00", "21:00"],
                "content_mix": "Short how-to videos: 'How to write chapter 3 in 1 hour', student struggles comedy",
                "hashtags": ["#NaijaStudent", "#ProjectHelp", "#StudentTips", "#LearnOnTikTok"],
                "algorithm_note": "Hook in first 1.5s. Relatable student stress content + solution performs best."
            },
            "facebook": {
                "best_times": ["10:00", "19:00"],
                "content_mix": "Long-form tips, student testimonials, shared articles",
                "hashtags": ["#ResearchHelp", "#NaijaStudents"],
                "algorithm_note": "Facebook groups drive traffic. Post shareable content students send to groupchats."
            },
            "youtube": {
                "best_times": ["17:00", "20:00"],
                "content_mix": "Shorts: quick thesis tips. Long-form: full project writing tutorials",
                "hashtags": ["#ProjectWriting", "#NigerianStudent", "#FinalYearProject"],
                "algorithm_note": "Title and thumbnail drive CTR. 'How to write [chapter] fast' performs well."
            },
            "twitter": {
                "best_times": ["09:00", "17:00"],
                "content_mix": "Threads on research tips, hot takes on ASUU/university system, polls",
                "hashtags": ["#NaijaTwitter", "#UniversityNG"],
                "algorithm_note": "Threads get more reach than single tweets. Engage with ASUU/education conversations."
            }
        }
    },
    {
        "name": "Examkits",
        "slug": "examkits",
        "description": "Exam preparatory platform for JAMB, Post UTME, WAEC and TRCN",
        "website": "https://examkits.com",
        "niche": "exam preparation, JAMB, WAEC, Post UTME, TRCN, Nigerian secondary and tertiary education",
        "target_audience": "Nigerian SS2/SS3 students and JAMB candidates, aged 15–22, parents of exam candidates",
        "platforms": ["instagram", "facebook", "tiktok", "youtube", "twitter"],
        "telegram_env_key": "TELEGRAM_EXAMKITS_CHAT_ID",
        "content_tone": "encouraging, motivational, direct, exam-focused, urgent during exam seasons",
        "search_keywords": [
            "post UTME 2025 screening news Nigeria", "Nigerian university admission list 2025",
            "scholarship for Nigerian students 2025", "university scholarship Nigeria undergraduate",
            "secondary school scholarship Nigeria 2025", "JAMB CAPS admission update",
            "Nigerian university cut off mark 2025", "international scholarship Nigeria students"
        ],
        "platform_strategy": {
            "instagram": {
                "best_times": ["07:00", "19:00"],
                "content_mix": "Carousels: past questions, exam tips. Reels: quick subject tricks",
                "hashtags": ["#JAMBPrep", "#WAEC2025", "#PostUTME", "#JAMB2025",
                             "#ExamSuccess", "#NigerianStudents", "#TRCN", "#NECOExam"],
                "algorithm_note": "Save-worthy content (past Q&A, formulas) drives saves → higher reach."
            },
            "tiktok": {
                "best_times": ["18:00", "21:00"],
                "content_mix": "Quick exam tips, 'Did you know?' subject facts, JAMB CBT simulation clips",
                "hashtags": ["#JAMBPrep", "#WAECTips", "#ExamSeason", "#LearnOnTikTok"],
                "algorithm_note": "Teen audience peaks 6–9pm. Study-with-me and exam countdown content goes viral."
            },
            "facebook": {
                "best_times": ["08:00", "18:00"],
                "content_mix": "Past questions, motivational posts, parent-targeted content",
                "hashtags": ["#JAMB2025", "#NigerianStudents"],
                "algorithm_note": "Parents share exam-related posts. Target both students and parents in copy."
            },
            "youtube": {
                "best_times": ["16:00", "19:00"],
                "content_mix": "Shorts: 1 exam tip per video. Long-form: full subject tutorials",
                "hashtags": ["#JAMBTutorial", "#WAECPrep", "#ExamkitsNG"],
                "algorithm_note": "Search-driven. Optimise titles: 'JAMB Mathematics Past Questions 2025 solved'."
            },
            "twitter": {
                "best_times": ["08:00", "16:00"],
                "content_mix": "JAMB news commentary, exam countdown, Q&A threads",
                "hashtags": ["#JAMB2025", "#NaijaTwitter"],
                "algorithm_note": "React fast to JAMB/WAEC breaking news for maximum visibility."
            }
        }
    },
    {
        "name": "Watmall",
        "slug": "watmall",
        "description": "Online marketplace for buying and selling products in Nigeria",
        "website": "https://watmall.com",
        "niche": "e-commerce, online shopping, Nigerian marketplace, buy and sell",
        "target_audience": "Nigerian online shoppers and small business owners, aged 20–40",
        "platforms": ["instagram", "facebook", "tiktok", "youtube", "twitter"],
        "telegram_env_key": "TELEGRAM_WATMALL_CHAT_ID",
        "content_tone": "exciting, deal-focused, vibrant, community-driven, trustworthy",
        "search_keywords": [
            "Nigeria e-commerce news", "online shopping Nigeria trends", "naira exchange rate",
            "Nigerian small business", "buy online Nigeria", "Jumia Konga competition",
            "Nigerian market trends", "Black Friday Nigeria"
        ],
        "platform_strategy": {
            "instagram": {
                "best_times": ["12:00", "19:00"],
                "content_mix": "Product showcases, seller success stories, deal announcements",
                "hashtags": ["#ShopNigeria", "#NaijaOnlineShopping", "#MadeInNigeria",
                             "#NaijaMarket", "#OnlineShoppingNG", "#NigerianBusiness", "#Watmall"],
                "algorithm_note": "Product reels with price reveals get high shares. Seller spotlight builds trust."
            },
            "tiktok": {
                "best_times": ["20:00", "22:00"],
                "content_mix": "Product unboxing, 'Shop with me', seller behind-the-scenes",
                "hashtags": ["#NaijaMarket", "#ShopTikTok", "#NigerianSeller", "#OnlineShopNG"],
                "algorithm_note": "Unboxing and 'what I ordered vs what I got' content performs extremely well."
            },
            "facebook": {
                "best_times": ["12:00", "20:00"],
                "content_mix": "Product listings, flash sales, marketplace tips for sellers",
                "hashtags": ["#BuyNigeria", "#NaijaMarket"],
                "algorithm_note": "Facebook Marketplace integration content drives organic reach."
            },
            "youtube": {
                "best_times": ["18:00", "21:00"],
                "content_mix": "How to sell on Watmall, shopping hauls, seller tutorials",
                "hashtags": ["#WatmallNG", "#OnlineShoppingNigeria", "#NaijaMarket"],
                "algorithm_note": "How-to content for sellers gets consistent search traffic."
            },
            "twitter": {
                "best_times": ["11:00", "18:00"],
                "content_mix": "Flash sale announcements, deal alerts, market commentary",
                "hashtags": ["#NaijaTwitter", "#ShopNigeria"],
                "algorithm_note": "Limited-time deals create urgency. Use countdown language."
            }
        }
    },
    {
        "name": "Payapp",
        "slug": "payapp",
        "description": "Nigerian bills payment app — pay electricity, DSTV, GoTV, EKEDC, IBEDC, water bills, airtime, data, school fees and more in seconds",
        "website": "https://payapp.ng",
        "niche": "bills payment, utility bills, DSTV subscription, electricity token, airtime top-up, data purchase, school fees payment, Nigerian bill payment app",
        "target_audience": "Nigerian households, parents, landlords, students and professionals aged 20–45 who pay regular bills (NEPA/electricity, cable TV, water, school fees, airtime)",
        "platforms": ["instagram", "facebook", "tiktok", "youtube", "twitter"],
        "telegram_env_key": "TELEGRAM_PAYAPP_CHAT_ID",
        "content_tone": "relatable, stress-free, convenience-focused, time-saving, friendly — speak to the everyday frustration of paying bills in Nigeria and how Payapp solves it instantly",
        "search_keywords": [
            "electricity bill payment Nigeria", "DSTV subscription renewal Nigeria",
            "EKEDC IBEDC token Nigeria", "pay bills online Nigeria",
            "airtime data purchase Nigeria", "school fees payment Nigeria",
            "water bill Nigeria", "GoTV renewal Nigeria", "utility bills Nigeria 2025"
        ],
        "platform_strategy": {
            "instagram": {
                "best_times": ["08:00", "18:00"],
                "content_mix": "Carousels: 'Bills you can pay on Payapp', how-to guides, bill payment tips, relatable bill stress memes turned solutions",
                "hashtags": ["#PayBillsNG", "#NaijaHousehold", "#ElectricityNigeria",
                             "#DSTVRenewal", "#PayappNG", "#BillsPaymentNG",
                             "#NoProblemWithBills", "#AirtimeDataNG"],
                "algorithm_note": "Relatable bill-stress content gets saved and shared. 'Things Nigerians hate paying manually' angle works great."
            },
            "tiktok": {
                "best_times": ["19:00", "21:00"],
                "content_mix": "Screen-record demos: paying DSTV/electricity in seconds, 'Watch me pay all my bills in 60 seconds', bill payment life hacks",
                "hashtags": ["#PayBillsNG", "#DSTVRenewal", "#NEPAToken", "#PayappNG", "#NaijaHacks"],
                "algorithm_note": "Screen demos showing real speed of paying bills get massive saves. 'You're still going to the bank to pay DSTV?' hook kills it."
            },
            "facebook": {
                "best_times": ["09:00", "17:00"],
                "content_mix": "Bill reminders content, household tips, relatable 'NEPA took light again' posts, testimonials from users who paid bills on the go",
                "hashtags": ["#PayBillsNG", "#NaijaHousehold"],
                "algorithm_note": "Household/family-relatable content gets shared in family WhatsApp-type Facebook groups."
            },
            "youtube": {
                "best_times": ["17:00", "20:00"],
                "content_mix": "How-to tutorials: 'How to pay EKEDC electricity bill on Payapp', 'How to renew DSTV without going anywhere', full bill payment walkthroughs",
                "hashtags": ["#PayappNG", "#PayBillsNigeria", "#ElectricityBillNG"],
                "algorithm_note": "Search-optimised titles like 'How to pay DSTV subscription online Nigeria 2025' drive consistent traffic."
            },
            "twitter": {
                "best_times": ["08:00", "17:00"],
                "content_mix": "Relatable bill-payment frustration tweets, NEPA/DSTV trending topic reactions, quick tips on avoiding bill queues",
                "hashtags": ["#NEPANigeria", "#DSTVNigeria"],
                "algorithm_note": "Join trending conversations about NEPA, DSTV, or fuel prices — add Payapp angle to viral threads."
            }
        }
    },
    {
        "name": "Realtour",
        "slug": "realtour",
        "description": "Nigerian real estate platform for property listings, tours, and transactions",
        "website": "https://realtour.ng",
        "niche": "real estate, property listings, Nigerian housing market, property investment",
        "target_audience": "Nigerian property seekers, investors, and real estate agents, aged 28–50",
        "platforms": ["instagram", "facebook", "tiktok", "youtube", "twitter"],
        "telegram_env_key": "TELEGRAM_REALTOUR_CHAT_ID",
        "content_tone": "aspirational, professional, trustworthy, investment-focused, lifestyle-driven",
        "search_keywords": [
            "Nigerian real estate news", "Lagos property prices 2025", "Abuja housing market",
            "Nigerian property investment", "real estate Nigeria trends", "mortgage Nigeria",
            "buy land Nigeria", "real estate developer Nigeria"
        ],
        "platform_strategy": {
            "instagram": {
                "best_times": ["10:00", "17:00"],
                "content_mix": "Property showcases, investment tips, before/after renovations, market insights",
                "hashtags": ["#NigerianRealEstate", "#BuyPropertyNG", "#LagosRealEstate",
                             "#NaijaHomes", "#PropertyNigeria", "#RealEstateNG",
                             "#RealtourNG", "#InvestNigeria"],
                "algorithm_note": "Property tour reels get high saves and shares. 'Properties under ₦X' content goes viral."
            },
            "tiktok": {
                "best_times": ["18:00", "20:00"],
                "content_mix": "Property tours, 'What ₦5M gets you in Lagos vs Abuja', real estate tips",
                "hashtags": ["#NaijaRealEstate", "#PropertyTour", "#HouseTour", "#RealEstateNG"],
                "algorithm_note": "Comparison content ('Lagos vs Abuja property') and property tours perform best."
            },
            "facebook": {
                "best_times": ["10:00", "18:00"],
                "content_mix": "Property listings, investment guides, market reports",
                "hashtags": ["#NigerianProperty", "#RealEstateNG"],
                "algorithm_note": "Older, higher-income audience on Facebook. Investment angle resonates more."
            },
            "youtube": {
                "best_times": ["16:00", "19:00"],
                "content_mix": "Full property tours, area guides, real estate investment tutorials",
                "hashtags": ["#NigerianRealEstate", "#PropertyTourNG", "#RealtourNG"],
                "algorithm_note": "Full property tour videos rank well in search. Include neighbourhood context."
            },
            "twitter": {
                "best_times": ["09:00", "16:00"],
                "content_mix": "Market insights, property investment threads, housing news commentary",
                "hashtags": ["#NaijaRealEstate", "#PropertyNG"],
                "algorithm_note": "Property investment threads with data/prices get high engagement from Lagos Twitter."
            }
        }
    },
    {
        "name": "Stanet Academy",
        "slug": "stanet-academy",
        "description": "Nigerian ICT academy offering digital skills and technology training",
        "website": "https://stanetacademy.com",
        "niche": "ICT training, digital skills, coding, technology education, Nigeria tech ecosystem",
        "target_audience": "Nigerian youth and professionals seeking tech skills, aged 18–35",
        "platforms": ["instagram", "facebook", "tiktok", "youtube", "twitter"],
        "telegram_env_key": "TELEGRAM_STANET_CHAT_ID",
        "content_tone": "inspiring, educational, empowering, tech-forward, community-driven",
        "search_keywords": [
            "Nigerian tech news", "digital skills Nigeria 2025", "coding bootcamp Nigeria",
            "tech jobs Nigeria", "freelancing Nigeria", "AI tools for Nigerians",
            "Nigeria tech ecosystem", "remote work Nigeria", "software developer Nigeria salary"
        ],
        "platform_strategy": {
            "instagram": {
                "best_times": ["08:00", "19:00"],
                "content_mix": "Skills carousels, student success stories, tech tips, course promos",
                "hashtags": ["#LearnTechNG", "#ICTNigeria", "#NaijaDigitalSkills",
                             "#TechEducationNG", "#CodingNigeria", "#DigitalSkillsNG",
                             "#StatetAcademy", "#TechYouthNG"],
                "algorithm_note": "Student transformation stories (before/after learning) get maximum saves and shares."
            },
            "tiktok": {
                "best_times": ["19:00", "22:00"],
                "content_mix": "60-second skill tutorials, 'Earn money with this skill', tech career tips",
                "hashtags": ["#LearnOnTikTok", "#TechSkillsNG", "#NaijaTech", "#CodingTips"],
                "algorithm_note": "'Learn this skill in 60 seconds' format performs extremely well. Income angle hooks viewers."
            },
            "facebook": {
                "best_times": ["09:00", "18:00"],
                "content_mix": "Course announcements, tech articles, student testimonials, free resource posts",
                "hashtags": ["#DigitalSkillsNG", "#ICTNigeria"],
                "algorithm_note": "Free resource offers ('Free Python tutorial') drive high shares in tech Facebook groups."
            },
            "youtube": {
                "best_times": ["17:00", "21:00"],
                "content_mix": "Full tutorials, course previews, student success documentaries, tech news",
                "hashtags": ["#LearnTechNG", "#NigerianTech", "#StatetAcademy"],
                "algorithm_note": "Tutorial content compounds in search over time. Consistent upload schedule critical."
            },
            "twitter": {
                "best_times": ["09:00", "17:00"],
                "content_mix": "Tech tips threads, Nigerian tech ecosystem commentary, skill-to-income threads",
                "hashtags": ["#NaijaTech", "#TechNG"],
                "algorithm_note": "'Thread: how I made ₦X with [skill]' format goes viral on Nigerian Twitter."
            }
        }
    }
]
