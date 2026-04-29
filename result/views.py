# views.py
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json
from .models import Student, SubjectResult

SUBJECTS = {
    'WT':   'Web Technology',
    'CD':   'Compiler Design',
    'DAA':  'Design & Analysis of Algorithms',
    'SDAM': 'Software Design & Modeling',
}

GRADE_SCALE = [
    (90, 'S', 10),
    (80, 'A',  9),
    (70, 'B',  8),
    (60, 'C',  7),
    (55, 'D',  6),
    (50, 'E',  5),
    ( 0, 'F',  0),
]

def get_grade(total):
    for min_marks, grade, points in GRADE_SCALE:
        if total >= min_marks:
            return grade, points
    return 'F', 0


def calculate_result(marks_data):
    """
    marks_data: dict { 'WT': {'mse': 80, 'ese': 75}, ... }
    Returns full result dict.
    """
    rows = []
    for code, subject_name in SUBJECTS.items():
        mse = float(marks_data[code]['mse'])
        ese = float(marks_data[code]['ese'])
        total = round(mse * 0.3 + ese * 0.7, 2)
        grade, points = get_grade(total)
        rows.append({
            'subject_code': code,
            'subject_name': subject_name,
            'mse_marks': mse,
            'ese_marks': ese,
            'total_marks': total,
            'grade': grade,
            'grade_points': points,
            'credits': 4,
        })

    total_credits = sum(r['credits'] for r in rows)
    weighted_points = sum(r['grade_points'] * r['credits'] for r in rows)
    cgpa = round(weighted_points / total_credits, 2)
    status = 'FAIL' if any(r['grade'] == 'F' for r in rows) else 'PASS'

    return {
        'subjects': rows,
        'cgpa': cgpa,
        'total_credits': total_credits,
        'status': status,
    }


def validate_marks(marks_data):
    """Returns list of error strings, empty if valid."""
    errors = []
    for code in SUBJECTS:
        if code not in marks_data:
            errors.append(f"Missing marks for {code}")
            continue
        for field in ('mse', 'ese'):
            try:
                val = float(marks_data[code][field])
                if not (0 <= val <= 100):
                    errors.append(f"{code} {field.upper()} must be between 0 and 100")
            except (KeyError, TypeError, ValueError):
                errors.append(f"{code} {field.upper()} is invalid or missing")
    return errors


@csrf_exempt
@require_http_methods(["POST"])
def calculate(request):
    """
    POST /api/result/calculate/
    Body: { "marks": { "WT": {"mse": 80, "ese": 75}, ... } }
    Returns calculated result without saving.
    """
    try:
        body = json.loads(request.body)
        marks_data = body.get('marks', {})

        errors = validate_marks(marks_data)
        if errors:
            return JsonResponse({'error': errors}, status=400)

        result = calculate_result(marks_data)
        return JsonResponse({'result': result}, status=200)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@csrf_exempt
@require_http_methods(["POST"])
def save_result(request):
    """
    POST /api/result/save/
    Body: {
        "student": { "name": "...", "reg_no": "...", "semester": 3 },
        "marks": { "WT": {"mse": 80, "ese": 75}, ... }
    }
    Saves student and results to DB, returns saved result.
    """
    try:
        body = json.loads(request.body)
        student_data = body.get('student', {})
        marks_data = body.get('marks', {})

        errors = validate_marks(marks_data)
        if errors:
            return JsonResponse({'error': errors}, status=400)

        student, _ = Student.objects.update_or_create(
            reg_no=student_data.get('reg_no', 'UNKNOWN'),
            defaults={
                'name': student_data.get('name', ''),
                'semester': student_data.get('semester', 1),
            }
        )

        result = calculate_result(marks_data)
        SubjectResult.objects.filter(student=student).delete()

        for row in result['subjects']:
            SubjectResult.objects.create(
                student=student,
                subject_code=row['subject_code'],
                mse_marks=row['mse_marks'],
                ese_marks=row['ese_marks'],
                total_marks=row['total_marks'],
                grade=row['grade'],
                grade_points=row['grade_points'],
                credits=row['credits'],
            )

        return JsonResponse({
            'message': 'Result saved successfully',
            'student': {'name': student.name, 'reg_no': student.reg_no, 'semester': student.semester},
            'result': result,
        }, status=201)

    except json.JSONDecodeError:
        return JsonResponse({'error': 'Invalid JSON'}, status=400)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=500)


@require_http_methods(["GET"])
def get_result(request, reg_no):
    """
    GET /api/result/<reg_no>/
    Returns saved result for a student.
    """
    try:
        student = Student.objects.get(reg_no=reg_no)
        subject_results = SubjectResult.objects.filter(student=student)

        rows = [{
            'subject_code': r.subject_code,
            'subject_name': SUBJECTS.get(r.subject_code, r.subject_code),
            'mse_marks': r.mse_marks,
            'ese_marks': r.ese_marks,
            'total_marks': r.total_marks,
            'grade': r.grade,
            'grade_points': r.grade_points,
            'credits': r.credits,
        } for r in subject_results]

        total_credits = sum(r['credits'] for r in rows)
        weighted_points = sum(r['grade_points'] * r['credits'] for r in rows)
        cgpa = round(weighted_points / total_credits, 2) if total_credits else 0
        status = 'FAIL' if any(r['grade'] == 'F' for r in rows) else 'PASS'

        return JsonResponse({
            'student': {'name': student.name, 'reg_no': student.reg_no, 'semester': student.semester},
            'result': {'subjects': rows, 'cgpa': cgpa, 'total_credits': total_credits, 'status': status},
        })

    except Student.DoesNotExist:
        return JsonResponse({'error': 'Student not found'}, status=404)
