from django.test import TestCase
from django.urls import reverse
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from apps.company.models import Company
from apps.employees.models import Employee
from datetime import date
from unittest.mock import patch

User = get_user_model()

class ExportFormatTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.company = Company.objects.create(name="Test Company")
        self.user = User.objects.create_user(
            username="testuser", 
            password="password", 
            company=self.company
        )
        self.client.force_authenticate(user=self.user)
        
    @patch('apps.attendance.services.AttendanceService.get_daily_stats')
    @patch('apps.attendance.services.AttendanceService.detect_anomalies')
    def test_daily_export_formats(self, mock_anomalies, mock_stats):
        mock_stats.return_value = {}
        mock_anomalies.return_value = []
        
        # Test PDF
        url = reverse('attendance-daily-export')
        response = self.client.get(url, {'date': '2023-01-01', 'format': 'pdf'})
        if response.status_code != 200:
            print(f"Daily PDF Error: {response.content}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        
        # Test Excel
        response = self.client.get(url, {'date': '2023-01-01', 'format': 'excel'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response['Content-Type'], 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )

    @patch('apps.attendance.services.AttendanceService.get_monthly_stats')
    @patch('apps.attendance.services.AttendanceService.get_employee_monthly_stats')
    def test_monthly_export_formats(self, mock_emp_stats, mock_stats):
        mock_stats.return_value = {}
        mock_emp_stats.return_value = []
        
        url = reverse('attendance-monthly-export')
        
        # Test PDF
        response = self.client.get(url, {'month': 1, 'year': 2023, 'format': 'pdf'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        
        # Test Excel
        response = self.client.get(url, {'month': 1, 'year': 2023, 'format': 'excel'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(
            response['Content-Type'], 
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
