import os
import shutil

src_dir = "frontend/src/pages/invoice-center/credit-notes"
dst_dir = "frontend/src/pages/invoice-center/debit-notes"
os.makedirs(dst_dir, exist_ok=True)
os.makedirs(os.path.join(dst_dir, "modals"), exist_ok=True)

replacements = {
    "CreditNote": "DebitNote",
    "credit_note": "debit_note",
    "creditNote": "debitNote",
    "credit-notes": "debit-notes",
    "Credit Notes": "Debit Notes",
    "Credit Note": "Debit Note",
    "Credit": "Debit",
    "credit": "debit",
    "CREDIT": "DEBIT",
}

for root, dirs, files in os.walk(src_dir):
    for file in files:
        src_file = os.path.join(root, file)
        
        # Calculate destination file path
        rel_path = os.path.relpath(root, src_dir)
        new_file = file.replace("CreditNote", "DebitNote")
        dst_root = os.path.join(dst_dir, rel_path) if rel_path != "." else dst_dir
        dst_file = os.path.join(dst_root, new_file)
        
        with open(src_file, "r") as f:
            content = f.read()
            
        for k, v in replacements.items():
            content = content.replace(k, v)
            
        with open(dst_file, "w") as f:
            f.write(content)

print("Pages copied successfully!")
