package br.bias.replay;

import net.minecraft.*;
import org.joml.Matrix4f;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.Redirect;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;

/** GameRenderer.renderHand: retains the vanilla renderer, arm and item models. */
@Mixin(value=class_757.class, remap=false)
public class NativeHandsMixin {
    @Inject(method="method_3172", at=@At("HEAD"), remap=false)
    private void syncHands(class_4184 camera, float delta, Matrix4f matrix, CallbackInfo ci) {
        class_742 target = NativeReplay.target();
        NativeReplay.drawingHands = target != null;
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

    @Inject(method="method_3172", at=@At("RETURN"), remap=false)
    private void finishHands(class_4184 camera, float delta, Matrix4f matrix, CallbackInfo ci) {
        NativeReplay.drawingHands = false;
    }
}
