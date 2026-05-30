import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/shared/widgets/skeuo_button.dart';
import 'package:mobile/shared/widgets/skeuo_text_field.dart';

class ForgotPasswordScreen extends StatelessWidget {
  const ForgotPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Forgot Password',
              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            Text(
              "Enter the email associated with your account and we'll send an email with instructions to reset your password.",
              style: TextStyle(color: AppColors.textMuted, fontSize: 16),
            ),
            const SizedBox(height: 40),
            const SkeuoTextField(
              label: 'Email Address',
              placeholder: 'john.doe@university.edu',
            ),
            const SizedBox(height: 32),
            SkeuoButton(
              text: 'Send Reset Link',
              onPressed: () => context.push('/reset-password'),
            ),
            const Spacer(),
            Center(
              child: GestureDetector(
                onTap: () => context.go('/login'),
                child: RichText(
                  text: const TextSpan(
                    style: TextStyle(color: AppColors.textMuted),
                    children: [
                      TextSpan(text: 'Remember your password? '),
                      TextSpan(
                        text: 'Log In',
                        style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
