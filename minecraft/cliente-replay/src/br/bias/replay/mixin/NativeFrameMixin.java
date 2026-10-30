package br.bias.replay.mixin;
import br.bias.replay.NativePoses;
import net.minecraft.class_757;
import net.minecraft.class_9779;
import org.spongepowered.asm.mixin.Mixin;
import org.spongepowered.asm.mixin.injection.At;
import org.spongepowered.asm.mixin.injection.Inject;
import org.spongepowered.asm.mixin.injection.callback.CallbackInfo;
@Mixin(value=class_757.class,remap=false)
public class NativeFrameMixin {
    @Inject(method="method_3188",at=@At("HEAD"),remap=false)
    private void recordedPoses(class_9779 counter,CallbackInfo ci){NativePoses.apply(counter.method_60637(false));}
}
