# Testing Guide - Simpli Framework

คู่มือการสร้างโปรเจคสำหรับทดสอบระบบ Simpli Framework

## 📋 สารบัญ

- [การทดสอบแบบ Manual](#การทดสอบแบบ-manual)
- [การทดสอบแบบ Automated](#การทดสอบแบบ-automated)
- [Test Scenarios](#test-scenarios)
- [Debugging](#debugging)

---

## 🛠️ การทดสอบแบบ Manual

### 1. สร้างโปรเจคใหม่จาก Template

```bash
# วิธีที่ 1: ใช้ npx (แนะนำ)
npx create-simpli@latest test-project

# วิธีที่ 2: ใช้ npm create
npm create simpli@latest test-project

# เลือก template
npm create simpli@latest test-project --template minimal
```

### 2. ทดสอบ Development Server

```bash
cd test-project

# ติดตั้ง dependencies
npm install

# รัน dev server
npm run dev

# หรือใช้ CLI โดยตรง
npx simpli dev

# ทดสอบบน port อื่น
npx simpli dev --port 3000 --open
```

**สิ่งที่ต้องตรวจสอบ:**
- [ ] Server start โดยไม่มี error
- [ ] HMR (Hot Module Replacement) ทำงาน
- [ ] แก้ไขไฟล์ `.mdx` แล้ว refresh อัตโนมัติ
- [ ] Dark mode toggle ทำงาน
- [ ] Search แสดงผล

### 3. ทดสอบ Production Build

```bash
# Build สำหรับ production
npm run build

# หรือ
npx simpli build

# Build ด้วย options
npx simpli build --outDir dist --emptyOutDir
```

**สิ่งที่ต้องตรวจสอบ:**
- [ ] Build สำเร็จไม่มี error
- [ ] ไฟล์ HTML ถูกสร้างใน `dist/`
- [ ] Assets (CSS, JS) ถูก bundle ถูกต้อง

### 4. ทดสอบ Serve Production

```bash
# Serve production build
npx simpli serve

# หรือบน port อื่น
npx simpli serve --port 8080
```

### 5. ทดสอบ CLI Commands

```bash
# Check project health
npx simpli doctor

# Clear cache
npx simpli clear

# Help
npx simpli --help
npx simpli dev --help
```

---

## 🤖 การทดสอบแบบ Automated

### 1. สร้าง Test Script

สร้างไฟล์ `scripts/test-project.js`:

```javascript
#!/usr/bin/env node
// Test script for Simpli Framework

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const TEST_DIR = 'test-simpli-project';
const TEST_TIMEOUT = 60000;

function cleanup() {
  console.log('🧹 Cleaning up...');
  if (fs.existsSync(TEST_DIR)) {
    fs.rmSync(TEST_DIR, { recursive: true, force: true });
  }
}

function runTest(name, fn) {
  console.log(`\n🧪 ${name}`);
  try {
    fn();
    console.log(`  ✅ Passed`);
    return true;
  } catch (error) {
    console.log(`  ❌ Failed: ${error.message}`);
    return false;
  }
}

// Main test suite
async function main() {
  console.log('🚀 Starting Simpli Framework Tests\n');
  
  let passed = 0;
  let failed = 0;
  
  // Cleanup before start
  cleanup();
  
  // Test 1: Create project
  if (runTest('Create project', () => {
    execSync(`node packages/create-simpli/bin/create-simpli.js ${TEST_DIR} --template default --skip-install`, {
      stdio: 'pipe',
      timeout: TEST_TIMEOUT,
    });
    if (!fs.existsSync(TEST_DIR)) {
      throw new Error('Project directory not created');
    }
  })) passed++; else failed++;
  
  // Test 2: Check project structure
  if (runTest('Check project structure', () => {
    const requiredFiles = [
      'package.json',
      'simpli.config.ts',
      'vite.config.ts',
      'tsconfig.json',
      'docs/intro.mdx',
    ];
    for (const file of requiredFiles) {
      if (!fs.existsSync(path.join(TEST_DIR, file))) {
        throw new Error(`Missing ${file}`);
      }
    }
  })) passed++; else failed++;
  
  // Test 3: Check config syntax
  if (runTest('Check config syntax', () => {
    const configPath = path.join(TEST_DIR, 'simpli.config.ts');
    const content = fs.readFileSync(configPath, 'utf-8');
    if (!content.includes('defineConfig')) {
      throw new Error('Config does not use defineConfig');
    }
    if (!content.includes('simpli-docs')) {
      throw new Error('Config does not import from simpli-docs');
    }
  })) passed++; else failed++;
  
  // Test 4: Validate package.json
  if (runTest('Validate package.json', () => {
    const pkgPath = path.join(TEST_DIR, 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    if (!pkg.dependencies?.['simpli-docs']) {
      throw new Error('Missing simpli-docs dependency');
    }
    if (!pkg.scripts?.dev) {
      throw new Error('Missing dev script');
    }
  })) passed++; else failed++;
  
  // Test 5: No blog references
  if (runTest('No blog references', () => {
    const configPath = path.join(TEST_DIR, 'simpli.config.ts');
    const content = fs.readFileSync(configPath, 'utf-8');
    if (content.toLowerCase().includes('blog')) {
      throw new Error('Config contains blog references');
    }
    // Check no blog directory exists
    if (fs.existsSync(path.join(TEST_DIR, 'blog'))) {
      throw new Error('Blog directory should not exist');
    }
  })) passed++; else failed++;
  
  // Summary
  console.log(`\n📊 Test Results:`);
  console.log(`  ✅ Passed: ${passed}`);
  console.log(`  ❌ Failed: ${failed}`);
  
  // Cleanup
  cleanup();
  
  process.exit(failed > 0 ? 1 : 0);
}

main().catch((error) => {
  console.error('💥 Test suite failed:', error);
  cleanup();
  process.exit(1);
});
```

### 2. รัน Test Script

```bash
# ทำให้ script executable
chmod +x scripts/test-project.js

# รัน test
node scripts/test-project.js
```

### 3. Integration with npm scripts

เพิ่มใน `package.json`:

```json
{
  "scripts": {
    "test:project": "node scripts/test-project.js",
    "test:e2e": "vitest run e2e",
    "test:unit": "vitest run unit"
  }
}
```

---

## 📋 Test Scenarios

### Scenario 1: Fresh Install

```bash
# 1. ลบ cache และ node_modules
npm run clean
rm -rf node_modules

# 2. ติดตั้งใหม่
npm install

# 3. Build packages
npm run build:packages

# 4. สร้างโปรเจคทดสอบ
npm run test:project
```

### Scenario 2: Config Validation

สร้าง `test-configs/invalid.config.ts`:

```typescript
import { defineConfig } from 'simpli-docs';

// ทดสอบ config ที่ไม่มี title (required)
export default defineConfig({
  // title: 'Missing',
  tagline: 'Test',
});
```

ทดสอบ:

```bash
# ควรแสดง error ว่าขาด title
cd test-project
cp ../test-configs/invalid.config.ts simpli.config.ts
npm run build
```

### Scenario 3: Content Processing

สร้างไฟล์ `docs/test.mdx`:

```mdx
---
title: Test Page
description: Testing content processing
sidebar_position: 99
tags: [test]
---

# Test Page

This is a test paragraph.

## Section 1

Content here.

```typescript
// Code block
const x = 1;
```

<Admonition type="tip">
  Test admonition
</Admonition>
```

ตรวจสอบ:
- [ ] Frontmatter ถูก parse ถูกต้อง
- [ ] Code block มี syntax highlighting
- [ ] Admonition แสดงถูกต้อง
- [ ] TOC แสดง headings

### Scenario 4: Search Functionality

```bash
# สร้างหลาย docs เพื่อทดสอบ search
mkdir -p docs/api docs/guide

# สร้างไฟล์
for i in {1..5}; do
  cat > "docs/page$i.mdx" << EOF
---
title: Page $i
description: Description for page $i
---

# Page $i

This is content for page $i with unique keyword KEYWORD_$i.
EOF
done

# Build และตรวจสอบ search index
npm run build
```

### Scenario 5: Dark Mode

```bash
# ทดสอบ toggle dark mode
# ตรวจสอบว่า localStorage มี theme preference
# ตรวจสอบว่า CSS variables เปลี่ยนตาม
```

---

## 🐛 Debugging

### Enable Debug Mode

```bash
# ตั้งค่า environment variable
DEBUG=simpli:* npm run dev

# หรือ
DEBUG=1 npx simpli dev
```

### Check Logs

```bash
# ดู build logs
npm run build 2>&1 | tee build.log

# ดู error ละเอียด
npx simpli build --verbose
```

### Inspect Config

```bash
# ตรวจสอบ config ที่ load
npx simpli doctor
```

### Check Virtual Modules

```bash
# Vite จะแสดง virtual modules ใน browser devtools
# ไปที่ Sources > Page > virtual:simpli/
```

---

## 📝 Checklist ก่อน Release

### Functionality
- [ ] `create-simpli` สร้างโปรเจคได้
- [ ] `simpli dev` รัน dev server ได้
- [ ] `simpli build` build production ได้
- [ ] `simpli serve` serve production ได้
- [ ] `simpli doctor` ตรวจสอบสุขภาพโปรเจคได้
- [ ] `simpli clear` ล้าง cache ได้

### Templates
- [ ] Default template ทำงานได้
- [ ] Minimal template ทำงานได้

### Features
- [ ] MDX rendering ถูกต้อง
- [ ] Frontmatter parsing ถูกต้อง
- [ ] Sidebar generation ถูกต้อง
- [ ] Search indexing ทำงานได้
- [ ] Dark mode toggle ทำงานได้
- [ ] Responsive design แสดงผลถูกต้อง

### Edge Cases
- [ ] Empty docs directory
- [ ] Special characters in filenames
- [ ] Unicode content (Thai, etc.)
- [ ] Large files
- [ ] Invalid config

---

## 🎯 Quick Test Commands

```bash
# One-liner test
npm run build:packages && node scripts/test-project.js

# Full test suite
npm run test

# E2E test with Playwright (ถ้ามี)
npx playwright test
```
