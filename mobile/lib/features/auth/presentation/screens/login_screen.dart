import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/shared/widgets/skeuo_button.dart';
import 'package:mobile/shared/widgets/skeuo_text_field.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: SingleChildScrollView(
        child: Column(
          children: [
            Container(
              height: 240,
              width: double.infinity,
              decoration: const BoxDecoration(
                image: DecorationImage(
                  image: NetworkImage('https://lh3.googleusercontent.com/aida-public/AB6AXuA2vYpkGdJ4Je7pBk96V9xZkMWIN5UZNnx8iGxF9-1rYYi3_m_bsfhonVBtxnCziWcr9Hi-6XvHMaYDJQppX8zpdWSFwGWBiFVjmZrJIcVG-uPJZrUwY8Ca4Dq7mK-lmjMa-OJJLjUsXZCv0zJSPS0TpAlU8QG4qQ4R0jworxzd5eaXy4fG205hXoajPMgJQh9t0K-4y3DLOXKzgkcaKbODQxPAb4XnblsCgGTXSLO9diALt-kjavBvpu6l3nTueluEYcE4CT5KKmiq'),
                  fit: BoxFit.cover,
                ),
              ),
              child: Container(
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    begin: Alignment.topCenter,
                    end: Alignment.bottomCenter,
                    colors: [
                      Colors.transparent,
                      AppColors.backgroundDark.withOpacity(0.9),
                    ],
                  ),
                ),
              ),
            ),
            Transform.translate(
              offset: const Offset(0, -40),
              child: Column(
                children: [
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.3),
                          blurRadius: 20,
                        ),
                      ],
                    ),
                    child: const Icon(Icons.school, size: 40, color: AppColors.backgroundDark),
                  ),
                  const SizedBox(height: 16),
                  RichText(
                    text: TextSpan(
                      style: Theme.of(context).textTheme.headlineLarge,
                      children: const [
                        TextSpan(text: 'University'),
                        TextSpan(text: 'App', style: TextStyle(color: AppColors.primary)),
                      ],
                    ),
                  ),
                  const Text(
                    'Premium Attendance Tracking',
                    style: TextStyle(color: AppColors.textMuted),
                  ),
                ],
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Welcome Back', style: Theme.of(context).textTheme.headlineMedium),
                  const SizedBox(height: 24),
                  const SkeuoTextField(
                    label: 'Username',
                    placeholder: 'Student ID or Email',
                  ),
                  const SizedBox(height: 16),
                  const SkeuoTextField(
                    label: 'Password',
                    placeholder: 'Enter Password',
                    isPassword: true,
                    suffixIcon: Icon(Icons.visibility_off, color: AppColors.textMuted),
                  ),
                  Align(
                    alignment: Alignment.centerRight,
                    child: TextButton(
                      onPressed: () => context.push('/forgot-password'),
                      child: const Text('Forgot Password?', style: TextStyle(color: AppColors.primary)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  SkeuoButton(
                    text: 'Log In',
                    onPressed: () => context.go('/otp-verification'),
                  ),
                  const SizedBox(height: 24),
                  Row(
                    children: [
                      Expanded(child: Divider(color: AppColors.outline.withOpacity(0.5))),
                      const Padding(
                        padding: EdgeInsets.symmetric(horizontal: 16),
                        child: Text('or', style: TextStyle(color: AppColors.textMuted)),
                      ),
                      Expanded(child: Divider(color: AppColors.outline.withOpacity(0.5))),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Center(
                    child: GestureDetector(
                      onTap: () => context.push('/role-selection'),
                      child: RichText(
                        text: const TextSpan(
                          style: TextStyle(color: AppColors.textMuted),
                          children: [
                            TextSpan(text: "Don't have an account? "),
                            TextSpan(
                              text: 'Sign Up',
                              style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                            ),
                          ],
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(height: 40),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
