import os
import glob

components_dir = "frontend/src/components/invoice-center"
os.makedirs(components_dir, exist_ok=True)

replacements = {
    "CreditNote": "DebitNote",
    "credit_note": "debit_note",
    "creditNote": "debitNote",
    "credit note": "debit note",
    "Credit Note": "Debit Note",
    "Credit": "Debit",
    "credit": "debit",
}

files_to_copy = glob.glob(os.path.join(components_dir, "CreditNote*.tsx"))

for file_path in files_to_copy:
    base_name = os.path.basename(file_path)
    new_name = base_name.replace("CreditNote", "DebitNote")
    new_path = os.path.join(components_dir, new_name)
    
    with open(file_path, "r") as f:
        content = f.read()
        
    for k, v in replacements.items():
        content = content.replace(k, v)
        
    with open(new_path, "w") as f:
        f.write(content)

print("Components created successfully!")
