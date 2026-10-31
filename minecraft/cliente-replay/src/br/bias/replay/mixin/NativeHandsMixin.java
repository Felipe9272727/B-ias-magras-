package br.bias.replay.mixin;
import br.bias.replay.NativeReplay;

import net.minecraft.*;
import org.joml.Matrix4f;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.Redirect;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfoReturnable;

/** GameRenderer.renderHand: retains the vanilla renderer, arm and item models. */
@Mixin(value=class_757.class, remap=false)
public class NativeHandsMixin {
    private long bias$nextDiagnostic;
    @Inject(method="method_3172", at=@At("HEAD"), remap=false)
    private void syncHands(class_4184 camera, float delta, Matrix4f matrix, CallbackInfo ci) {
        class_742 target = NativeReplay.target();
        NativeReplay.drawingHands = target != null;
        if (System.currentTimeMillis() > bias$nextDiagnostic) {
            bias$nextDiagnostic = System.currentTimeMillis() + 10000;
            System.out.println("[bias-native] renderHand target=" + (target == null ? "null" : target.method_7334().getName()));
        }
        if (target == null) return;
        class_746 local = class_310.method_1551().field_1724;
        local.method_31548().field_7545 = 0;
        local.method_31548().method_5447(0, target.method_6047().method_7972());
        local.method_31548().method_5447(40, target.method_6079().method_7972());
        local.field_6251 = target.field_6251;
        local.field_6229 = target.field_6229;
        local.method_36456(target.method_36454());
        local.method_36457(target.method_36455());
        local.field_3931 = local.field_3932 = target.method_36454();
        local.field_3914 = local.field_3916 = target.method_36455();
    }

    @Redirect(method="method_3172", at=@At(value="FIELD", target="Lnet/minecraft/class_315;field_1842:Z"), remap=false)
    private boolean retainHandsWithHiddenHud(class_315 options) {
        return NativeReplay.target() == null && options.field_1842;
    }

    @Redirect(method="method_3172", at=@At(value="INVOKE", target="Lnet/minecraft/class_636;method_2920()Lnet/minecraft/class_1934;"), remap=false)
    private class_1934 retainHandsWhileSpectating(class_636 interaction) {
        return NativeReplay.target() == null ? interaction.method_2920() : class_1934.field_9215;
    }

    /** Vanilla's hand framing assumes a wide display. Keep its full models in a
        portrait viewport using a separate, proportionally scaled hand projection. */
    @Inject(method="method_22973", at=@At("RETURN"), remap=false)
    private void portraitHands(float fov, CallbackInfoReturnable<Matrix4f> ci) {
        if (!NativeReplay.drawingHands) return;
        Matrix4f projection = ci.getReturnValue();
        float aspect = projection.m11() / projection.m00();
        if (aspect >= 1.0f) return;
        float factor = aspect / (4.0f / 3.0f);
        projection.m00(projection.m00() * factor);
        projection.m11(projection.m11() * factor);
        projection.m21(projection.m21() + 0.5f);
        class_742 target = NativeReplay.target();
        if (target != null && target.method_6079().method_7960()) {
            float inset = target.method_6047().method_7960() ? 0.15f : 0.55f;
            if (target.method_6068() != class_1306.field_6183) inset = -inset;
            projection.m20(projection.m20() + inset);
        }
    }

    @Inject(method="method_3172", at=@At("RETURN"), remap=false)
    private void finishHands(class_4184 camera, float delta, Matrix4f matrix, CallbackInfo ci) {
        NativeReplay.drawingHands = false;
    }
}
