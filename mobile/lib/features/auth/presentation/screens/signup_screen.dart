import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/shared/widgets/skeuo_button.dart';
import 'package:mobile/shared/widgets/skeuo_text_field.dart';

class SignupScreen extends StatelessWidget {
  const SignupScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Sign Up', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Create your account', style: Theme.of(context).textTheme.headlineMedium),
            const SizedBox(height: 24),
            const SkeuoTextField(
              label: 'Full Name',
              placeholder: 'Enter your full name',
            ),
            const SizedBox(height: 16),
            const SkeuoTextField(
              label: 'Email Address',
              placeholder: 'Enter your email',
            ),
            const SizedBox(height: 16),
            const SkeuoTextField(
              label: 'Password',
              placeholder: 'Create a password',
              isPassword: true,
              suffixIcon: Icon(Icons.visibility_off, color: AppColors.textMuted),
            ),
            const SizedBox(height: 40),
            SkeuoButton(
              text: 'Create Account',
              onPressed: () => context.go('/email-verification'),
              suffixIcon: const Icon(Icons.arrow_forward),
            ),
          ],
        ),
      ),
    );
  }
}
