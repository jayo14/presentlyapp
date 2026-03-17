"""
Django management command to populate the database with seed data.

This command creates realistic institution, college, department, course,
and user data for testing and demonstration purposes.
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth.hashers import make_password
from institutions.models import (
    User, Institution, College, Department, 
    Course, CourseEnrollment, Timetable, Attendance
)
from datetime import datetime, timedelta
import random


class Command(BaseCommand):
    help = 'Populate the database with seed data for testing and demonstration'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.clear_data()

        self.stdout.write('Starting seed data population...\n')
        
        # Create institutions
        institutions = self.create_institutions()
        self.stdout.write(f'Created {len(institutions)} institutions')
        
        # Create colleges for each institution
        colleges = self.create_colleges(institutions)
        self.stdout.write(f'Created {len(colleges)} colleges')
        
        # Create departments for each college
        departments = self.create_departments(colleges)
        self.stdout.write(f'Created {len(departments)} departments')
        
        # Create courses for each department
        courses = self.create_courses(departments)
        self.stdout.write(f'Created {len(courses)} courses')
        
        # Create users (admin, lecturers, students)
        users = self.create_users(institutions)
        self.stdout.write(f'Created {len(users)} users')
        
        # Create course enrollments
        enrollments = self.create_enrollments(courses, users)
        self.stdout.write(f'Created {len(enrollments)} course enrollments')
        
        # Create timetables
        timetables = self.create_timetables(courses)
        self.stdout.write(f'Created {len(timetables)} timetables')
        
        self.stdout.write(self.style.SUCCESS('\nSeed data population completed successfully!'))

    def clear_data(self):
        """Clear existing data"""
        self.stdout.write('Clearing existing data...')
        Attendance.objects.all().delete()
        Timetable.objects.all().delete()
        CourseEnrollment.objects.all().delete()
        Course.objects.all().delete()
        Department.objects.all().delete()
        College.objects.all().delete()
        User.objects.all().delete()
        Institution.objects.all().delete()
        self.stdout.write('Data cleared successfully\n')

    def create_institutions(self):
        """Create institutions"""
        institutions_data = [
            {
                'full_name': 'Lagos State University of Science and Technology',
                'short_name': 'LASUSTECH',
                'abbreviation': 'LASUSTECH',
                'country': 'Nigeria',
                'state_province': 'Lagos',
                'city': 'Ikorodu',
                'address': 'Ikorodu, Lagos, Nigeria',
                'contact_phone': '+234 803 123 4567',
                'contact_email': 'info@lasustech.edu.ng',
                'institution_type': 'UNIVERSITY',
            },
            {
                'full_name': 'University of Nigeria, Nsukka',
                'short_name': 'UNN',
                'abbreviation': 'UNN',
                'country': 'Nigeria',
                'state_province': 'Enugu',
                'city': 'Nsukka',
                'address': 'Nsukka, Enugu, Nigeria',
                'contact_phone': '+234 803 456 7890',
                'contact_email': 'admin@unn.edu.ng',
                'institution_type': 'UNIVERSITY',
            },
            {
                'full_name': 'Obafemi Awolowo University',
                'short_name': 'OAU',
                'abbreviation': 'OAU',
                'country': 'Nigeria',
                'state_province': 'Osun',
                'city': 'Ile-Ife',
                'address': 'Ile-Ife, Osun, Nigeria',
                'contact_phone': '+234 803 789 0123',
                'contact_email': 'info@oau.edu.ng',
                'institution_type': 'UNIVERSITY',
            },
            {
                'full_name': 'Federal University of Technology, Akure',
                'short_name': 'FUTA',
                'abbreviation': 'FUTA',
                'country': 'Nigeria',
                'state_province': 'Ondo',
                'city': 'Akure',
                'address': 'Akure, Ondo, Nigeria',
                'contact_phone': '+234 803 234 5678',
                'contact_email': 'contact@futa.edu.ng',
                'institution_type': 'UNIVERSITY',
            },
            {
                'full_name': 'Ahmadu Bello University',
                'short_name': 'ABU',
                'abbreviation': 'ABU',
                'country': 'Nigeria',
                'state_province': 'Kaduna',
                'city': 'Zaria',
                'address': 'Zaria, Kaduna, Nigeria',
                'contact_phone': '+234 803 567 8901',
                'contact_email': 'info@abu.edu.ng',
                'institution_type': 'UNIVERSITY',
            },
        ]
        
        institutions = []
        for data in institutions_data:
            institution, created = Institution.objects.get_or_create(
                abbreviation=data['abbreviation'],
                defaults={
                    'full_name': data['full_name'],
                    'short_name': data['short_name'],
                    'country': data['country'],
                    'state_province': data['state_province'],
                    'city': data['city'],
                    'address': data['address'],
                    'contact_phone': data['contact_phone'],
                    'contact_email': data['contact_email'],
                    'institution_type': data['institution_type'],
                }
            )
            institutions.append(institution)
            if created:
                self.stdout.write(f'  Created Institution: {institution.full_name}')
        
        return institutions

    def create_colleges(self, institutions):
        """Create colleges within institutions"""
        colleges_data = {
            'LASUSTECH': [
                {'name': 'College of Basic Science', 'abbreviation': 'CBS'},
                {'name': 'College of Engineering and Technology', 'abbreviation': 'COET'},
                {'name': 'College of Applied Social Sciences', 'abbreviation': 'CASS'},
            ],
            'UNN': [
                {'name': 'Faculty of Science', 'abbreviation': 'FOS'},
                {'name': 'Faculty of Biological Sciences', 'abbreviation': 'FBS'},
                {'name': 'Faculty of Education', 'abbreviation': 'FOE'},
            ],
            'OAU': [
                {'name': 'Faculty of Science', 'abbreviation': 'FOS'},
                {'name': 'Faculty of Technology', 'abbreviation': 'FOT'},
            ],
            'FUTA': [
                {'name': 'School of Engineering and Engineering Technology', 'abbreviation': 'SEET'},
                {'name': 'School of Sciences', 'abbreviation': 'SOS'},
            ],
            'ABU': [
                {'name': 'Faculty of Science', 'abbreviation': 'FOS'},
                {'name': 'Faculty of Technology', 'abbreviation': 'FOT'},
            ],
        }
        
        colleges = []
        for institution in institutions:
            college_list = colleges_data.get(institution.short_name, [])
            for data in college_list:
                college, created = College.objects.get_or_create(
                    institution=institution,
                    abbreviation=data['abbreviation'],
                    defaults={
                        'name': data['name'],
                        'code': data['abbreviation'],
                    }
                )
                colleges.append(college)
                if created:
                    self.stdout.write(
                        f'  Created College: {college.name} ({institution.short_name})'
                    )
        
        return colleges

    def create_departments(self, colleges):
        """Create departments within colleges (depends on colleges -> institutions)"""
        departments_data = {
            'CBS': [
                {'name': 'Department of Physics', 'code': 'PHYS'},
                {'name': 'Department of Chemistry', 'code': 'CHEM'},
                {'name': 'Department of Biology', 'code': 'BIO'},
                {'name': 'Department of Mathematics', 'code': 'MATH'},
            ],
            'COET': [
                {'name': 'Department of Civil Engineering', 'code': 'CIVIL'},
                {'name': 'Department of Electrical Engineering', 'code': 'ELEC'},
                {'name': 'Department of Mechanical Engineering', 'code': 'MECH'},
            ],
            'CASS': [
                {'name': 'Department of Economics', 'code': 'ECON'},
                {'name': 'Department of Political Science', 'code': 'POLSC'},
            ],
            'FOS': [
                {'name': 'Department of Physics', 'code': 'PHYS'},
                {'name': 'Department of Chemistry', 'code': 'CHEM'},
                {'name': 'Department of Botany', 'code': 'BOT'},
                {'name': 'Department of Zoology', 'code': 'ZOO'},
            ],
            'FBS': [
                {'name': 'Department of Microbiology', 'code': 'MICRO'},
                {'name': 'Department of Genetics', 'code': 'GEN'},
            ],
            'FOE': [
                {'name': 'Department of Science Education', 'code': 'SCEDU'},
            ],
            'FOT': [
                {'name': 'Department of Mechanical Engineering', 'code': 'MECH'},
            ],
            'SEET': [
                {'name': 'Department of Electrical Engineering', 'code': 'ELEC'},
                {'name': 'Department of Mechanical Engineering', 'code': 'MECH'},
            ],
            'SOS': [
                {'name': 'Department of Physics', 'code': 'PHYS'},
                {'name': 'Department of Chemistry', 'code': 'CHEM'},
            ],
        }
        
        departments = []
        for college in colleges:
            dept_list = departments_data.get(college.abbreviation, [])
            for data in dept_list:
                department, created = Department.objects.get_or_create(
                    college=college,
                    code=data['code'],
                    defaults={
                        'name': data['name'],
                        'abbreviation': data['code'],
                        'institution': college.institution,
                    }
                )
                departments.append(department)
                if created:
                    self.stdout.write(
                        f'  Created Department: {department.name} ({college.abbreviation})'
                    )
        
        return departments

    def create_courses(self, departments):
        """Create courses (many departments can offer same course)"""
        course_codes = ['101', '102', '103', '104', '201', '202', '203', '301', '302']
        course_names = [
            'Introduction to ', 'Advanced ', 'Applied ', 
            'Theoretical ', 'Practical ', 'Computational '
        ]
        
        courses = []
        
        for dept in departments:
            num_courses = random.randint(4, 7)
            for i in range(num_courses):
                code = f'{dept.code}{course_codes[i % len(course_codes)]}'
                subject = dept.name.split('of')[-1].strip() if 'of' in dept.name else dept.name
                title = f'{random.choice(course_names)}{subject}'
                
                # Create or get course (no department in filter since it's M2M)
                course, created = Course.objects.get_or_create(
                    code=code,
                    defaults={
                        'title': title,
                        'credit_units': random.choice([2, 3, 4]),
                        'semester': random.choice(['FIRST', 'SECOND']),
                        'level': random.choice(['100', '200', '300', '400']),
                    }
                )
                
                # Add department to the course (M2M relationship)
                if not course.department.filter(id=dept.id).exists():
                    course.department.add(dept)
                
                if course not in courses:
                    courses.append(course)
                    if created:
                        self.stdout.write(f'  Created Course: {course.code} - {course.title}')
        
        return courses

    def create_users(self, institutions):
        """Create users (admin, lecturers, students)"""
        users = []
        
        # Create superadmin
        superadmin, created = User.objects.get_or_create(
            email='admin@presently.ng',
            defaults={
                'full_name': 'System Administrator',
                'matric_number': 'ADMIN001',
                'role': 'ADMIN',
                'phone_number': '+234 803 000 0001',
                'password': make_password('admin123456'),
                'is_active': True,
            }
        )
        users.append(superadmin)
        if created:
            self.stdout.write('  Created Superadmin user')
        
        # Create institution admins
        for institution in institutions:
            admin, created = User.objects.get_or_create(
                email=f'admin@{institution.short_name.lower()}.edu.ng',
                defaults={
                    'full_name': f'Admin {institution.short_name}',
                    'matric_number': f'{institution.abbreviation}ADMIN',
                    'role': 'ADMIN',
                    'phone_number': f'+234 803 000 {random.randint(1000, 9999)}',
                    'institution': institution,
                    'password': make_password('admin123456'),
                    'is_active': True,
                }
            )
            users.append(admin)
            if created:
                self.stdout.write(f'  Created Admin for {institution.short_name}')
        
        # Create lecturers
        lecturer_count = 0
        for institution in institutions:
            for i in range(random.randint(5, 8)):
                email = f'lecturer{lecturer_count}@{institution.short_name.lower()}.edu.ng'
                lecturer, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'full_name': f'Lecturer User{lecturer_count}',
                        'matric_number': f'{institution.abbreviation}LECT{lecturer_count:03d}',
                        'role': 'LECTURER',
                        'phone_number': f'+234 803 100 {lecturer_count % 10000:04d}',
                        'institution': institution,
                        'password': make_password('lecturer123456'),
                        'is_active': True,
                    }
                )
                users.append(lecturer)
                if created:
                    self.stdout.write(f'  Created Lecturer: {email}')
                lecturer_count += 1
        
        # Create students
        student_count = 0
        for institution in institutions:
            for i in range(random.randint(15, 25)):
                email = f'student{student_count}@{institution.short_name.lower()}.edu.ng'
                student, created = User.objects.get_or_create(
                    email=email,
                    defaults={
                        'full_name': f'Student User{student_count}',
                        'matric_number': f'{institution.abbreviation}STU{student_count:05d}',
                        'role': 'STUDENT',
                        'phone_number': f'+234 803 200 {student_count % 10000:04d}',
                        'institution': institution,
                        'password': make_password('student123456'),
                        'is_active': True,
                    }
                )
                users.append(student)
                if created:
                    self.stdout.write(f'  Created Student: {email}')
                student_count += 1
        
        return users

    def create_enrollments(self, courses, users):
        """Create course enrollments"""
        students = [u for u in users if u.role == 'STUDENT']
        enrollments = []
        
        for student in students:
            # Each student enrolls in 4-6 courses
            num_courses = random.randint(4, 6)
            chosen_courses = random.sample(courses, 
                min(num_courses, len(courses)))
            
            for course in chosen_courses:
                enrollment, created = CourseEnrollment.objects.get_or_create(
                    student=student,
                    course=course,
                    defaults={
                        'is_active': True,
                        'status': 'ENROLLED',
                    }
                )
                enrollments.append(enrollment)
                if created:
                    self.stdout.write(
                        f'  Enrolled {student.email} in {course.code}'
                    )
        
        return enrollments

    def create_timetables(self, courses):
        """Create timetables for courses"""
        from datetime import time
        
        timetables = []
        day_choices = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY']
        start_times = [time(8, 0), time(10, 0), time(12, 0), time(14, 0)]
        end_times = [time(9, 30), time(11, 30), time(13, 30), time(15, 30)]
        
        for course in courses:
            # Create 2-3 timetables per course
            num_timetables = random.randint(2, 3)
            for i in range(num_timetables):
                day = random.choice(day_choices)
                start_idx = random.randint(0, len(start_times) - 1)
                start_time = start_times[start_idx]
                end_time = end_times[start_idx]
                semester = random.choice(['FIRST', 'SECOND'])
                
                timetable, created = Timetable.objects.get_or_create(
                    course=course,
                    day_of_week=day,
                    start_time=start_time,
                    end_time=end_time,
                    defaults={
                        'semester': semester,
                        'academic_year': '2025/2026',
                        'is_recurring': True,
                    }
                )
                timetables.append(timetable)
                if created:
                    self.stdout.write(
                        f'  Created Timetable: {course.code} - '
                        f'{day} {start_time} - {end_time}'
                    )
        
        return timetables

    def create_attendance(self, enrollments, timetables):
        """Create attendance records"""
        attendance_count = 0
        
        # Create attendance for the last 20 days
        day_mapping = {
            'Monday': 'MONDAY',
            'Tuesday': 'TUESDAY',
            'Wednesday': 'WEDNESDAY',
            'Thursday': 'THURSDAY',
            'Friday': 'FRIDAY',
            'Saturday': 'SATURDAY',
            'Sunday': 'SUNDAY',
        }
        
        for i in range(20):
            date = timezone.now().date() - timedelta(days=i)
            
            # Get timetables for this day of week
            day_name = date.strftime('%A')
            day_constant = day_mapping.get(day_name, 'MONDAY')
            day_timetables = [t for t in timetables if t.day_of_week == day_constant]
            
            for timetable in day_timetables:
                # Mark attendance for students in this course
                course_enrollments = [
                    e for e in enrollments 
                    if e.course == timetable.course
                ]
                
                for enrollment in course_enrollments:
                    # 85% attendance rate
                    if random.random() < 0.85:
                        attendance, created = Attendance.objects.get_or_create(
                            student=enrollment.student,
                            timetable=timetable,
                            date=date,
                            defaults={'status': 'Present'}
                        )
                        if created:
                            attendance_count += 1
        
        return attendance_count
