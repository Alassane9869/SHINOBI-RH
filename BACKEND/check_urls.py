#!/usr/bin/env python
"""Script pour vérifier les URLs enregistrées dans Django"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings')
django.setup()

from django.urls import get_resolver
from pprint import pprint

print("=" * 70)
print("URLS ENREGISTRÉES POUR /api/attendance/")
print("=" * 70)

resolver = get_resolver()

# Trouver le pattern attendance
for url_pattern in resolver.url_patterns:
    pattern_str = str(url_pattern.pattern)
    if 'attendance' in pattern_str:
        print(f"\nPattern principal: {pattern_str}")
        if hasattr(url_pattern, 'url_patterns'):
            print("  Sous-patterns:")
            for sub_pattern in url_pattern.url_patterns:
                if hasattr(sub_pattern, 'url_patterns'):
                    for subsub in sub_pattern.url_patterns:
                        print(f"    - {subsub.pattern} -> {subsub.callback}")
                else:
                    print(f"    - {sub_pattern.pattern} -> {getattr(sub_pattern, 'callback', 'N/A')}")

print("\n" + "=" * 70)
print("TEST DE RÉSOLUTION D'URL")
print("=" * 70)

from django.urls import resolve
from django.urls.exceptions import Resolver404

test_urls = [
    '/api/attendance/',
    '/api/attendance/export/daily/',
    '/api/attendance/export/daily-advanced/',
    '/api/attendance/export/monthly/',
    '/api/attendance/export/monthly-advanced/',
]

for url in test_urls:
    try:
        match = resolve(url)
        print(f"✓ {url}")
        print(f"  View: {match.func}")
        print(f"  Name: {match.url_name}")
    except Resolver404:
        print(f"✗ {url} - NOT FOUND!")

print("\n" + "=" * 70)
