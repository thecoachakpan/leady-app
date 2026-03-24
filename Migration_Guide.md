# Supabase Migration Guide 🛠️

Follow these simple steps to update your database so the new **Settings** and **Dashboard** features work perfectly.

### Step 1: Open the SQL Editor
1. Log in to your [Supabase Dashboard](https://app.supabase.com/).
2. Select your **Leady** project.
3. On the left-hand sidebar, click the **SQL Editor** icon (it looks like a terminal `>_`).

### Step 2: Create a New Query
1. Click **+ New query** at the top of the SQL Editor.
2. You can rename it to "Add Profile Fields" if you like.

### Step 3: Copy and Run the SQL
1. If this is your **first time** setting up the database, you need to create the tables first. 
2. Copy the content of [Full_Schema.sql](file:///c:/Users/Victor%20Akpan/Documents/Antigravity/leady/Full_Schema.sql) and run it.
3. If you **already have the tables** but are missing the new business fields, run the code below:

```sql
-- Use this ONLY if you already have the tables
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS business_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'NGN',
ADD COLUMN IF NOT EXISTS website TEXT;
```


2. Paste it into the editor.
3. Click the **Run** button (bottom right) or press `Cmd + Enter` / `Ctrl + Enter`.

### Troubleshooting
- **Success!**: If you see "Success", you're good! Refresh your app.
- **"Already Exists"**: If you see an error saying something "already exists", don't worry—it means that table is already there. The script is designed to be **safe to run multiple times**.

---

## ⚡ How to Rerun the Full Schema (Step-by-Step)

If you've already run the code before but need to apply the latest updates (like the new **First Name** and **Last Name** fields):

1. **Open your editor** and navigate to [Full_Schema.sql](file:///c:/Users/Victor%20Akpan/Documents/Antigravity/leady/Full_Schema.sql).
2. **Copy Everything**: Press `Ctrl + A` (Select All) then `Ctrl + C` (Copy).
3. **Go to Supabase**: Open your project's [SQL Editor](https://app.supabase.com/).
4. **New Query**: Click the **"+ New query"** button (don't reuse an old one to stay clean).
5. **Paste & Run**: Paste the code (`Ctrl + V`) and click the big green **Run** button.

### Step 4: Verify
- You should see a "Success" message at the bottom.
- Your app is now ready to save your business details in the **Settings** page!

---

![Supabase Guide](file:///C:/Users/Victor%20Akpan/.gemini/antigravity/brain/8b25a1e4-143a-4597-b223-9fae039ff87e/supabase_sql_editor_guide_1774285808398.png)
