import re

with open('backend/institutions/views.py', 'r') as f:
    content = f.read()

# Fix the broken import block
broken_block = r'OnboardingSerializer, InstitutionSerializer, CollegeSerializer,\s+from \.attendance_logic import perform_attendance_check_in\s+DepartmentSerializer'
fixed_block = 'OnboardingSerializer, InstitutionSerializer, CollegeSerializer,\n    DepartmentSerializer'
content = re.sub(broken_block, fixed_block, content)

# Ensure perform_attendance_check_in is imported at the top correctly
if 'from .attendance_logic import perform_attendance_check_in' not in content:
    content = content.replace('from .models import (', 'from .attendance_logic import perform_attendance_check_in\nfrom .models import (')
else:
    # Remove any existing misplaced one
    content = content.replace('from .attendance_logic import perform_attendance_check_in', '')
    content = content.replace('from .models import (', 'from .attendance_logic import perform_attendance_check_in\nfrom .models import (')

with open('backend/institutions/views.py', 'w') as f:
    f.write(content)
