# models.py
from django.db import models

class Student(models.Model):
    name = models.CharField(max_length=100)
    reg_no = models.CharField(max_length=20, unique=True)
    semester = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.reg_no} - {self.name}"


class SubjectResult(models.Model):
    SUBJECT_CHOICES = [
        ('WT', 'Web Technology'),
        ('CD', 'Compiler Design'),
        ('DAA', 'Design & Analysis of Algorithms'),
        ('SDAM', 'Software Design & Modeling'),
    ]

    GRADE_CHOICES = [
        ('S', 'S'), ('A', 'A'), ('B', 'B'),
        ('C', 'C'), ('D', 'D'), ('E', 'E'), ('F', 'F'),
    ]

    student = models.ForeignKey(Student, on_delete=models.CASCADE, related_name='results')
    subject_code = models.CharField(max_length=10, choices=SUBJECT_CHOICES)
    mse_marks = models.FloatField()   # out of 100
    ese_marks = models.FloatField()   # out of 100
    total_marks = models.FloatField() # weighted: MSE*0.3 + ESE*0.7
    grade = models.CharField(max_length=2, choices=GRADE_CHOICES)
    grade_points = models.IntegerField()
    credits = models.IntegerField(default=4)

    class Meta:
        unique_together = ('student', 'subject_code')

    def __str__(self):
        return f"{self.student.reg_no} - {self.subject_code}: {self.grade}"
