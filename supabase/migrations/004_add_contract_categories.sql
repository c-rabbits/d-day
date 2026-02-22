-- 카테고리 9칸: 금융/대출, 교육 추가 (기존: RENT, PHONE, CAR_INSURANCE, GYM, RENTAL, STREAMING, OTHER)
ALTER TYPE contract_category ADD VALUE 'FINANCE';
ALTER TYPE contract_category ADD VALUE 'EDUCATION';
