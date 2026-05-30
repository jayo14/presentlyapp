import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:mobile/core/theme/app_colors.dart';
import 'package:mobile/core/theme/app_theme.dart';
import 'package:mobile/shared/widgets/skeuo_button.dart';
import 'package:mobile/shared/widgets/skeuo_text_field.dart';

class ResetPasswordScreen extends StatelessWidget {
  const ResetPasswordScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => context.pop(),
        ),
        title: const Text('Reset Password', style: TextStyle(fontWeight: FontWeight.bold)),
        centerTitle: true,
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Create new password',
              style: AppTheme.manropeDisplay.copyWith(fontSize: 28),
            ),
            const SizedBox(height: 8),
            Text(
              'Your new password must be different from previous used passwords.',
              style: TextStyle(color: AppColors.textMuted),
            ),
            const SizedBox(height: 32),
            SkeuoTextField(
              label: 'New Password',
              placeholder: 'Enter new password',
              isPassword: true,
              suffixIcon: IconButton(
                icon: const Icon(Icons.visibility_off, color: AppColors.textMuted),
                onPressed: () {},
              ),
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                _buildIndicator('8+ chars', true),
                const SizedBox(width: 16),
                _buildIndicator('1 number', true),
                const SizedBox(width: 16),
                _buildIndicator('1 special char', false),
              ],
            ),
            const SizedBox(height: 24),
            SkeuoTextField(
              label: 'Confirm Password',
              placeholder: 'Re-enter new password',
              isPassword: true,
              suffixIcon: IconButton(
                icon: const Icon(Icons.visibility_off, color: AppColors.textMuted),
                onPressed: () {},
              ),
            ),
            const SizedBox(height: 8),
            Text('Both passwords must match.', style: TextStyle(color: AppColors.textMuted, fontSize: 12)),
            const Spacer(),
            SkeuoButton(
              text: 'Update Password',
              onPressed: () => context.push('/reset-success'),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildIndicator(String text, bool isMet) {
    return Row(
      children: [
        Icon(
          isMet ? Icons.check_circle : Icons.radio_button_unchecked,
          size: 16,
          color: isMet ? AppColors.primary : AppColors.textMuted,
        ),
        const SizedBox(width: 4),
        Text(
          text,
          style: TextStyle(
            fontSize: 12,
            color: isMet ? AppColors.primary : AppColors.textMuted,
            fontWeight: isMet ? FontWeight.bold : FontWeight.normal,
          ),
        ),
      ],
    );
  }
}
